/**
 * Utility functions for store data parsing
 */
const StoreParserUtils = {
    /**
     * Get current time in seconds for Jakarta timezone
     */
    getCurrentJakartaTimeInSeconds: () => {
        const date = new Date();
        const jakartaTime = new Intl.DateTimeFormat("en-US", {
            timeZone: "Asia/Jakarta",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: false,
        }).formatToParts(date);

        return (
            parseInt(
                jakartaTime.find((part) => part.type === "hour").value,
                10
            ) *
                3600 +
            parseInt(
                jakartaTime.find((part) => part.type === "minute").value,
                10
            ) *
                60 +
            parseInt(
                jakartaTime.find((part) => part.type === "second").value,
                10
            )
        );
    },

    /**
     * Get all promotion labels
     */
    getAllPromotionLabels: (promotionLabels = []) => {
        return promotionLabels
            .filter((promo) => promo.label && promo.label.trim() !== "")
            .map((promo) => promo.label);
    },

    /**
     * Format distance from meters to kilometers
     */
    formatDistance: (distance) => (distance / 1000).toFixed(1),
};

/**
 * Parse individual store data
 */
const parseStoreData = (store, distance, status, promotionLabels = []) => {
    if (!store?.location) {
        throw new Error("Invalid store data");
    }

    const { name, location, rating_score } = store;
    const { address, latitude, longitude } = location;
    const promoLabels = StoreParserUtils.getAllPromotionLabels(promotionLabels);

    const infoLines = [
        `Resto\t\t: ${status}`,
        `Rating\t: ${rating_score?.toFixed(1) || "N/A"}`,
        `Jarak\t\t: ${StoreParserUtils.formatDistance(distance)} km`,
        ...(promoLabels.length > 0
            ? [`Promo\t: ${promoLabels.join(", ")}`]
            : []),
    ];

    return {
        Alamat: address || "Unknown",
        Nama: name || "Unknown",
        Opsi: infoLines.join("\n"),
        Tikor: `${latitude},${longitude}`,
        // Tambahkan properti untuk semua label promosi
        //SemuaPromo: promoLabels
    };
};

/**
 * Determine store status based on opening status
 */
const determineStoreStatus = (openingStatus) => {
    if (!openingStatus) return "CLOSE";

    const currentTime = StoreParserUtils.getCurrentJakartaTimeInSeconds();
    const closingTime = openingStatus?.current_opening_time?.end_relative_sec;
    const secondsUntilClose = closingTime ? closingTime - currentTime : null;

    if (
        secondsUntilClose !== null &&
        secondsUntilClose <= 900 &&
        secondsUntilClose > 0
    ) {
        return "CLOSING_SOON";
    }

    return parseInt(openingStatus?.opening_status, 10) === 2 ? "OPEN" : "CLOSE";
};

/**
 * Base parser for store cards
 */
const parseStoreCards = (cards = []) => {
    return cards.map((card) => {
        const { store, distance, opening_status, promotion_label } = card;
        const status = determineStoreStatus(opening_status);
        return parseStoreData(store, distance, status, promotion_label);
    });
};

/**
 * Parse API response data
 */
export const parseResponse = (data) => {
    if (!data || typeof data !== "object") {
        throw new Error("Invalid response data");
    }

    const storeCards = Array.isArray(data.data?.store_cards)
        ? data.data.store_cards
        : [];
    const parsedCards = parseStoreCards(storeCards);

    // Tambahkan properti untuk semua label unik dari semua toko
    const allUniqueLabels = [
        ...new Set(parsedCards.flatMap((card) => card.SemuaPromo)),
    ];

    return {
        komo: parsedCards,
        //semuaLabelPromo: allUniqueLabels
    };
};

/**
 * Parse search results data
 */
export const parseResult = (data) => {
    if (!data || typeof data !== "object") {
        throw new Error("Invalid response data");
    }

    const searchResults = Array.isArray(data.data?.search_results)
        ? data.data.search_results
        : [];

    const storeCards = searchResults
        .map((result) => result.store_card)
        .filter((card) => card?.store);

    const parsedCards = parseStoreCards(storeCards);

    // Tambahkan properti untuk semua label unik dari semua toko
    const allUniqueLabels = [
        ...new Set(parsedCards.flatMap((card) => card.SemuaPromo)),
    ];

    return {
        komo: parsedCards,
        //semuaLabelPromo: allUniqueLabels
    };
};
