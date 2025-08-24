import { auth } from "../config/db.js";
import {
    Terdekat,
    Termurah,
    Terlaris,
    Promosi,
    FoodyByKeyword,
} from "../modules/check.js";

const validateFields = (fields) => {
    for (const [key, value] of Object.entries(fields)) {
        if (!value) throw new Error(`Missing required field: '${key}'.`);
    }
};

const withDeviceAndLokasi = (fn) => (device, lokasi) => {
    validateFields({ device, lokasi });
    return fn(device, lokasi);
};

const withDeviceLokasiAndKeyword = (fn) => (device, lokasi, keyword) => {
    validateFields({ device, lokasi, keyword });
    return fn(device, lokasi, keyword);
};

const typeHandlers = {
    Mars: withDeviceAndLokasi(auth),
    Terdekat: withDeviceAndLokasi(Terdekat),
    Termurah: withDeviceAndLokasi(Termurah),
    Terlaris: withDeviceAndLokasi(Terlaris),
    Promosi: withDeviceAndLokasi(Promosi),
    ShopeeFood: withDeviceLokasiAndKeyword(FoodyByKeyword),
};

export const apiService = async (data) => {
    console.log("Received data:", data);

    const { type, device, lokasi, keyword } = data;
    if (!type) throw new Error("Missing required field: 'type'.");

    const handler = typeHandlers[type];
    if (!handler) throw new Error(`Unrecognized Type: '${type}'.`);

    return await handler(device, lokasi, keyword);
};
