import axios from "axios";
import { CONFIG } from "../config.js";
import UserAgent from "user-agents";
import { parseResponse, parseResult } from "./response.js";

// Common constants for API parameters
const BASE_API_PARAMS = {
    page_num: 1,
    page_size: 20,
    source: 2,
    listing_type: 1,
    business_type: 1,
    need_group_stores: true,
    collection_publish_id: "",
    from_source: "",
    sub_content_ids: null,
    is_quick_filter_enabled: true,
    is_first_entry: false,
};

const BASE_FILTER = {
    partner_types: [2],
    rating_score_min: 0,
    rating_score_max: 5,
    store_tags: [],
    store_tags_logic: 1,
    store_categories_logic: 1,
    dish_tags: [],
    is_pickup_supported: 0,
    enable_customize_max_distance: 0,
    position_mode: 1,
    display_position: 99,
};

export default class Shopee {
    constructor() {
        this.userAgent = new UserAgent({ deviceCategory: "mobile" }).toString();
    }

    // === Public methods ===
    async getRestaurantTerdekat(tikor) {
        return this._fetchRestaurants(tikor, this._buildParamsTerdekat);
    }

    async getRestaurantTermurah(tikor) {
        return this._fetchRestaurants(tikor, this._buildParamsTermurah);
    }

    async getRestaurantPromo(tikor) {
        return this._fetchRestaurants(tikor, this._buildParamsPromo);
    }

    async getRestaurantTerlaris(tikor) {
        return this._fetchRestaurants(tikor, this._buildParamsTerlaris);
    }

    async getRestaurantsByKeyword(tikor, keyword) {
        this._validateTikor(tikor);
        this._validateKeyword(keyword);
        const data = this._buildSearchParams(tikor, keyword);
        return this._makeRequest(CONFIG.shopee.search, data, true);
    }

    // === Parameter builders ===
    _buildSearchParams(tikor, keyword) {
        const { latitude, longitude } = this._parseTikor(tikor);
        return {
            location_group_ids: ["1", "49"],
            keyword,
            latitude,
            longitude,
            page_size: 20,
            page_num: 1,
            sort_type: 1,
            need_rewrite: true,
        };
    }

    _buildParamsTerdekat(tikor) {
        return this._buildBaseParams(tikor, {
            content_id: "96822",
            quick_filter_ids: ["16", "12", "15", "11", "19"],
            sort_type: 2,
            search_id: "b7ab0721766343b796acd42c6cba352d",
            algo_property: JSON.stringify({
                circle_id: "108385",
                display_name: "Sekitarmu",
                city_id: 101380696896948,
                location: 1,
                PageType: "foody_home",
                TargetType: "home_circle",
            }),
        });
    }

    _buildParamsTermurah(tikor) {
        return this._buildBaseParams(tikor, {
            content_id: "91477",
            quick_filter_ids: ["16", "15", "11", "19"],
            is_first_entry: true,
            filter: {
                ...BASE_FILTER,
                store_tags: ["2647544884132352"],
            },
            algo_property: JSON.stringify({
                circle_id: "109808",
                display_name: "Diskon Rame Rame",
                city_id: 101380696896948,
                location: 5,
                PageType: "foody_home",
                TargetType: "home_circle",
            }),
        });
    }

    _buildParamsPromo(tikor) {
        return this._buildBaseParams(tikor, {
            content_id: "106941",
            quick_filter_ids: ["16", "15", "11", "19"],
            is_first_entry: true,
            filter: {
                ...BASE_FILTER,
                store_tags: [
                    "2646082192652800",
                    "2646082194127360",
                    "2646082194012160",
                    "2646082194274304",
                    "2646082195273728",
                    "2646249314023424",
                    "2646131460454912",
                    "2646131460569600",
                    "2646249314728448",
                    "2646249314908672",
                ],
            },
            algo_property: JSON.stringify({
                circle_id: "108388",
                display_name: "Diskon Terus",
                city_id: 101380696896948,
                location: 0,
                PageType: "foody_home",
                TargetType: "home_circle",
            }),
        });
    }

    _buildParamsTerlaris(tikor) {
        return this._buildBaseParams(tikor, {
            content_id: "96822",
            quick_filter_ids: ["16", "12", "15", "11", "19"],
            sort_type: 3,
            search_id: "b7ab0721766343b796acd42c6cba352d",
            algo_property: JSON.stringify({
                circle_id: "108385",
                display_name: "Sekitarmu",
                city_id: 101380696896948,
                location: 1,
                PageType: "foody_home",
                TargetType: "home_circle",
            }),
        });
    }

    // === Helpers ===
    _buildBaseParams(tikor, specificParams) {
        const { latitude, longitude } = this._parseTikor(tikor);
        const base = {
            ...BASE_API_PARAMS,
            longitude,
            latitude,
            filter: BASE_FILTER,
        };

        // biar filter bisa merge, bukan overwrite
        if (specificParams.filter) {
            base.filter = { ...BASE_FILTER, ...specificParams.filter };
        }

        return { ...base, ...specificParams };
    }

    _parseTikor(tikor) {
        const parts = tikor.split(",").map(parseFloat);
        if (parts.length !== 2 || parts.some(isNaN)) {
            throw new Error("Invalid tikor: must be 'latitude,longitude'");
        }
        return { latitude: parts[0], longitude: parts[1] };
    }

    async _fetchRestaurants(tikor, paramsBuilder) {
        this._validateTikor(tikor);
        const data = paramsBuilder.call(this, tikor);
        return this._makeRequest(CONFIG.shopee.foody, data);
    }

    async _makeRequest(url, data, isSearch = false) {
        try {
            const response = await axios.post(url, data, {
                headers: this._getHeaders(),
            });

            if (response.status !== 200) {
                throw new Error(`Unexpected status: ${response.status}`);
            }

            return isSearch
                ? parseResult(response.data)
                : parseResponse(response.data);
        } catch (error) {
            throw new Error(`Shopee API request failed: ${error.message}`);
        }
    }

    _getHeaders() {
        return {
            "User-Agent": this.userAgent,
            "Content-Type": "application/json",
            Cookie: CONFIG.shopee.cookie, // sebaiknya pindah ke config
        };
    }

    _validateTikor(tikor) {
        if (!tikor || typeof tikor !== "string" || !tikor.includes(",")) {
            throw new Error("Invalid tikor: expected 'latitude,longitude'");
        }
    }

    _validateKeyword(keyword) {
        if (!keyword || typeof keyword !== "string") {
            throw new Error("Keyword must be a non-empty string");
        }
    }
}
