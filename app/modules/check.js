import { isExpired } from "../config/db.js";
import Gojek from "./gojek/api.js";
import Grab from "./grab/api.js";
import Shopee from "./shopee/api.js";
import dotenv from "dotenv";

dotenv.config();

const gojek = new Gojek(process.env.GOJEK_TOKEN);
const grab = new Grab(process.env.GRABS_TOKEN);
const shopee = new Shopee();

const checkUserActivity = async (device) => {
    const active = await isExpired(device);
    if (active.error || active.message !== "User is active.") {
        return { status: 401, message: "Regist dulu bang" };
    }
    return null;
};

const handleApiCall = async (device, apiFunction, ...args) => {
    const activityCheck = await checkUserActivity(device);
    if (activityCheck) return activityCheck;
    return await apiFunction(...args);
};

// Exported functions
export const GofoodNearBy = async (device, tikor) =>
    handleApiCall(device, gojek.getRestaurantNearBy.bind(gojek), tikor);

export const GofoodByKeyword = async (device, tikor, keyword) =>
    handleApiCall(
        device,
        gojek.getRestaurantsByKeyword.bind(gojek),
        tikor,
        keyword
    );

export const getDrivers = async (device, tikor) =>
    handleApiCall(device, gojek.getDrivers.bind(gojek), tikor);

export const poiGoride = async (device, tikor) =>
    handleApiCall(device, gojek.pickup.bind(gojek), tikor);

export const Terdekat = async (device, tikor) =>
    handleApiCall(device, shopee.getRestaurantTerdekat.bind(shopee), tikor);

export const Terlaris = async (device, tikor) =>
    handleApiCall(device, shopee.getRestaurantTerlaris.bind(shopee), tikor);

export const Termurah = async (device, tikor) =>
    handleApiCall(device, shopee.getRestaurantTermurah.bind(shopee), tikor);

export const Promosi = async (device, tikor) =>
    handleApiCall(device, shopee.getRestaurantPromo.bind(shopee), tikor);

export const FoodyByKeyword = async (device, tikor, keyword) =>
    handleApiCall(
        device,
        shopee.getRestaurantsByKeyword.bind(shopee),
        tikor,
        keyword
    );

export const GrabfoodNearBy = async (device, tikor) =>
    handleApiCall(device, grab.getRestaurantNearBy.bind(grab), tikor);

export const GrabfoodByKeyword = async (device, tikor, keyword) =>
    handleApiCall(
        device,
        grab.getRestaurantsByKeyword.bind(grab),
        tikor,
        keyword
    );

export const searchSpots = async (device, tikor, keyword) =>
    handleApiCall(device, gojek.searchSpots.bind(gojek), tikor, keyword);
