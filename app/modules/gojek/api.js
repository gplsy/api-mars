import axios from "axios";
import { CONFIG } from "../config.js";
import {
    parseResponse,
    parseDrivers,
    parseResponsePickup,
    extractCoordinates,
} from "./response.js";

export default class Gojek {
    constructor(token) {
        this.token = token;
    }

    // Public APIs

    async getRestaurantNearBy(tikor) {
        this._validateTikor(tikor);
        return this._fetchAndParse(CONFIG.gojek.restaurants, this._buildParams(tikor), parseResponse);
    }

    async getRestaurantsByKeyword(tikor, keyword) {
        this._validateTikor(tikor);
        this._validateKeyword(keyword);

        const params = {
            ...this._buildParams(tikor),
            search: keyword,
            disable_spell_correction: false,
            dish_refiner_tab_enabled: true,
            intent_identification_enabled: true,
            is_no_qu_enabled: true,
            refiners_enabled: true,
            variant_name: "treatment-2-No-QU-1_3_batch_4_dish_tab_major_1",
            is_dynamic_filter_applied: false,
        };

        return this._fetchAndParse(CONFIG.gojek.search, params, parseResponse);
    }

    async getDrivers(tikor) {
        this._validateTikor(tikor);
        const params = { location: tikor, cluster: true };
        return this._fetchAndParse(CONFIG.gojek.drivers, params, parseDrivers);
    }

    async pickup(tikor) {
        this._validateTikor(tikor);
        const params = { service_type: 1, location: tikor, source: "map" };
        return this._fetchAndParse(CONFIG.gojek.pickup, params, parseResponsePickup);
    }

    async searchSpots(tikor, keyword) {
        this._validateTikor(tikor);
        this._validateKeyword(keyword);

        const params = {
            keyword,
            service_type: 1,
            location: tikor,
            selected_location: tikor,
            location_type: "pickup",
        };

        return this._fetchAndParse(CONFIG.gojek.spots, params, extractCoordinates);
    }

    // Private helpers

    _buildParams(tikor) {
        return {
            filter_enabled: true,
            collection: "NEAR_ME",
            source: "SHUFFLE",
            template_id: "gofood:platter:gofood-home-v3:gofood_home_revamp_experience_bar",
            picked_loc: tikor,
            redesign_enabled: true,
            super_partner_enabled: true,
            include_banner: false,
        };
    }

    _buildHeaders() {
        const baseHeaders = {
            "User-Agent": "Gojek/5.20.1 (com.gojek.app; build:5202; Android, 13)",
            Connection: "Keep-Alive",
            Accept: "application/json",
            "Accept-Encoding": "gzip",
            "Content-Type": "application/json",
            "X-Platform": "Android",
            "X-UniqueId": "54edf7d9b828657a",
            "X-Session-ID": "7de128cb-678b-40fc-933b-73b861fad86a",
            "X-AppVersion": "5.20.1",
            "X-User-Type": "customer",
            "X-DeviceOS": "Android,13",
            "User-uuid": "851706525",
            "X-DeviceToken": "edX-8O2bRrWGSctXX9hkbj:APA91bE_WEit16sOVZmeKIorVXa0opmvLiu-dQnj8y5CK6dccf0x05sLCXexM0_Pz3Tzi5e3f-qk4MFzw_RUleMg6VjHiBm5xW9DZfB2bkfd1BF29taQR3Y",
            "X-PhoneMake": "Xiaomi",
            "X-PushTokenType": "FCM",
            "X-PhoneModel": "Xiaomi,Mi A1",
            "Accept-Language": "en-ID",
            "X-User-Locale": "en_ID",
            "X-Location-Accuracy": "20.0",
            "Gojek-Country-Code": "ID",
            "Gojek-Service-Area": "1",
            "Gojek-Timezone": "Asia/Jakarta",
        };

        if (this.token) {
            baseHeaders.Authorization = `Bearer ${this.token}`;
        }

        return baseHeaders;
    }

    async _fetchAndParse(url, params, parser) {
        try {
            console.log(`Fetching data from ${url}`, { params });
            const headers = this._buildHeaders();
            const response = await axios.get(url, { params, headers });
            return parser(response.data);
        } catch (error) {
            this._handleError(error);
        }
    }

    _validateTikor(tikor) {
        if (!tikor) throw new Error("Tikor (location) is required.");
    }

    _validateKeyword(keyword) {
        if (!keyword) throw new Error("Keyword (search) is required.");
    }

    _handleError(error) {
        console.error("API Error:", error.message);
        if (error.response) {
            console.error("Response Data:", error.response.data);
            throw error.response.data;
        }
        throw { message: error.message };
    }
}