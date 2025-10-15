import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Bike from "@/models/Bike";
import Reservation from "@/models/Reservation";
import { dbConnect } from "@/lib/mongodb";
import { getMqttClient } from "@/lib/mqttClient";

export async function POST(request, { params }) {
    try {
        await dbConnect()
        const client = getMqttClient()
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({error: "Not logged in"}, {status: 403})
        }

        const {id} = await params
        const {qrCode} = await request.json()

        console.log(`Reservation id: ${id}`)
        console.log(`QR data: ${qrCode}`)

        const reservation = await Reservation.findById(id)
        if (!reservation) {
            return NextResponse.json({error: "Reservation not found"}, {status: 404})
        }

        if (reservation.userId !== session.user.id) {
            return NextResponse.json({error: "Unauthorized action"}, {status: 401})
        }

        const bike = await Bike.find({name: 'B001'})
        if (!bike) {
            return NextResponse.json({error: "Bike not found"}, {status: 404})
        }

        const topic = `bike/B001/command`
        const message = 'unlock'

        client.publish(topic, message, {qos: 1}, (err) => {
        if (err) {
            return new Response(JSON.stringify({success: false, error: err.message}), {status: 500})
        }
        console.log("MQTT command sent:",topic,message)
        })

        const updatedBike = await Bike.findOneAndUpdate(
            {name: 'B001'},
            {
                $set: {
                    isLocked: false
                }
            },
            {new: true}
        )

        return NextResponse.json({updatedBike}, {status: 200})

    } catch (err) {
        console.error(err)
        return NextResponse.json({error: "Internal server error"}, {status: 500})
    }
}