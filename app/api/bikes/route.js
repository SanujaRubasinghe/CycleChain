import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Bike from "@/models/Bike";

export async function GET() {
    try {
        await dbConnect()

        const bikes = await Bike.find({})
        return NextResponse.json(bikes, {status: 200})
    } catch (err) {
        console.log(err)
        return NextResponse.json({error: err.message}, {status: 500})
    }
}