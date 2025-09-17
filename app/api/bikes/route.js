// app/api/bikes/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/db";
import mongoose from "mongoose";

export async function GET() {
    try {
        console.log("Connecting to database for bikes...");
        await dbConnect();
        console.log("Database connected successfully");

        const db = mongoose.connection.db;

        // Check if Bike collection exists
        const collections = await db.listCollections().toArray();
        const bikeCollection = collections.find(col => col.name === 'Bike');

        if (!bikeCollection) {
            return NextResponse.json({
                success: false,
                message: "Bike collection not found",
                availableCollections: collections.map(col => col.name)
            }, { status: 404 });
        }

        // Get all bikes from the collection
        const bikes = await db.collection('Bike').find({}).toArray();
        console.log("Raw bikes from database:", bikes.length);

        if (bikes.length === 0) {
            return NextResponse.json({
                success: true,
                data: [],
                message: "No bikes found in collection",
                count: 0
            }, { status: 200 });
        }

        // Transform the data to match your frontend expectations
        const transformedBikes = bikes.map((bike, index) => {
            // Convert MongoDB ObjectId to string
            const bikeData = { ...bike };
            if (bikeData._id && typeof bikeData._id === 'object') {
                bikeData._id = bikeData._id.toString();
            }

            // Extract location from various possible field structures
            let location = null;

            // Check different possible location formats
            if (bikeData.currentLocation) {
                if (bikeData.currentLocation.lat !== undefined && bikeData.currentLocation.lng !== undefined) {
                    location = bikeData.currentLocation;
                } else if (Array.isArray(bikeData.currentLocation)) {
                    // Handle array format [lat, lng] or [lng, lat]
                    location = {
                        lat: bikeData.currentLocation[0],
                        lng: bikeData.currentLocation[1]
                    };
                }
            } else if (bikeData.location) {
                if (bikeData.location.lat !== undefined && bikeData.location.lng !== undefined) {
                    location = bikeData.location;
                } else if (Array.isArray(bikeData.location)) {
                    location = {
                        lat: bikeData.location[0],
                        lng: bikeData.location[1]
                    };
                }
            } else if (bikeData.coordinates && Array.isArray(bikeData.coordinates)) {
                // Handle GeoJSON format [longitude, latitude]
                location = {
                    lat: bikeData.coordinates[1],
                    lng: bikeData.coordinates[0]
                };
            } else if (bikeData.lat !== undefined && bikeData.lng !== undefined) {
                // Handle flat structure
                location = { lat: bikeData.lat, lng: bikeData.lng };
            }

            // Create consistent structure for frontend
            return {
                _id: bikeData._id || `bike_${index}`,
                bikeId: bikeData.bikeId || bikeData.id || bikeData._id || `bike_${index}`,
                name: bikeData.name || bikeData.bikeName || `Bike ${index + 1}`,
                type: bikeData.type || 'standard',
                status: bikeData.status || 'available',
                battery: bikeData.battery !== undefined ? bikeData.battery : Math.floor(Math.random() * 100),
                currentLocation: location,
                location: location, // Add both for compatibility
                qrCode: bikeData.qrCode || bikeData.qr || `QR_${bikeData._id || index}`,
                // Include all original fields
                ...bikeData
            };
        });

        console.log("Successfully transformed", transformedBikes.length, "bikes");

        return NextResponse.json({
            success: true,
            data: transformedBikes,
            count: transformedBikes.length
        }, { status: 200 });

    } catch (error) {
        console.error("GET bikes error:", error);
        return NextResponse.json({
            success: false,
            message: error.message,
            error: error.toString()
        }, { status: 500 });
    }
}