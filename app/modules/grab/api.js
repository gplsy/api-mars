import axios from "axios";
import { CONFIG } from "../config.js";
import parseResponse from "./response.js";

export default class Grab {
    constructor(token) {
        this.token = token;
    }

    /**
     * Fetch nearby restaurants
     * @param {string} tikor - Latitude and longitude (e.g., "-6.327988,106.8652313")
     * @returns {Promise<object>} - Parsed response data
     */
    async getRestaurantNearBy(tikor) {
        const params = this._buildParams({ tikor });
        return this._fetchData(CONFIG.grab.restaurants, params);
    }

    /**
     * Fetch restaurants by keyword
     * @param {string} tikor - Latitude and longitude
     * @param {string} keyword - Search keyword
     * @returns {Promise<object>} - Parsed response data
     */
    async getRestaurantsByKeyword(tikor, keyword) {
        const params = this._buildParams({ tikor, keyword });
        return this._fetchData(CONFIG.grab.search, params, "POST");
    }

    /**
     * Build query parameters for the API request
     * @param {object} options - Options for building parameters
     * @returns {object} - Query parameters
     */
    _buildParams({ tikor, keyword }) {
        const baseParams = {
            latlng: tikor,
            searchID: "",
            offset: 0,
            pageSize: 20,
            requireSortAndFilters: true,
            dryrunSortAndFilters: false,
            poiID: "IT.1MPNTCRHM4DD0",
            searchMetadata: "",
        };

        if (keyword) {
            return {
                ...baseParams,
                keyword,
                source: "recent_search",
                enableServiceBasedMenu: true,
            };
        }

        return {
            ...baseParams,
            categoryShortcutID: 229,
            filtersApplied: false,
            keyword: "",
            sourceType: "",
        };
    }

    /**
     * Build headers for the API request
     * @returns {object} - Request headers
     */
    _setHeaders() {
        const headers = {
            "User-Agent": "Grab/5.356.0 (Android 13; Build 105741098)",
            "x-device-timezone": "Asia/Jakarta",
            "x-device-time-format": "12h",
        };

        if (this.token) {
            headers["x-mts-ssid"] = this.token;
        } else {
            console.warn(
                "Warning: No token provided. Requests may fail with 401 Unauthorized."
            );
        }

        return headers;
    }

    /**
     * Fetch data from the API
     * @param {string} url - API endpoint
     * @param {object} params - Query parameters
     * @param {string} method - HTTP method (default: "GET")
     * @returns {Promise<object>} - Parsed response data
     */
    async _fetchData(url, params, method = "GET") {
        const headers = this._setHeaders();

        try {
            console.log(`Fetching data from ${url} with method ${method}`, {
                params,
                headers,
            });
            const response = await axios({
                method,
                url,
                params: method === "GET" ? params : undefined,
                data: method === "POST" ? params : undefined,
                headers,
            });
            return parseResponse(response.data);
        } catch (error) {
            this._handleError(error);
        }
    }

    /**
     * Handle API errors
     * @param {Error} error - Error object
     * @throws {Error} - Processed error
     */
    _handleError(error) {
        if (error.response) {
            console.error("API Error:", {
                status: error.response.status,
                data: error.response.data,
            });

            if (error.response.status === 401) {
                throw new Error("Unauthorized: Invalid or missing token.");
            }

            throw new Error(`API Error: ${error.response.statusText}`);
        }

        console.error("Network or other error:", error.message);
        throw new Error("An unexpected error occurred. Please try again.");
    }
}
