const parseResponse = (data) => {
    if (!data || typeof data !== "object") {
        throw new Error("Invalid response data");
    }

    const restaurants = Array.isArray(data?.searchResult?.searchMerchants)
        ? data.searchResult.searchMerchants
        : [];

    const statusMapping = {
        OPENED: "OPEN", // Restoran buka
        OPENED_CLOSING_SOON: "CLOSING_SOON", // Restoran buka tetapi akan segera tutup
        OPENED_WITHIN_ENLARGED_RADIUS: "OPENED_WITHIN_ENLARGED_RADIUS", // Tidak ada status yang relevan untuk radius diperbesar
        CLOSED: "CLOSED", // Restoran tutup
        BUSY: "BUSY", // Restoran sedang sibuk
        CLOSED_BACK_SOON: "SEDANG TUTUP", // Restoran tutup sementara dan akan segera buka
        CLOSED_SCHEDULE_AVALIABLE: "CLOSED", // Tidak ada status yang relevan untuk jadwal tersedia
        CLOSED_SCHEDULE_AVAILABLE: "CLOSED", // Duplikasi dari CLOSED_SCHEDULE_AVALIABLE
        CLOSED_OUT_OF_RADIUS: "CLOSED", // Restoran berada di luar radius pengiriman
        OUT_OF_RADIUS_PERMANENT: "OUT OF RADIUS", // Restoran berada di luar radius secara permanen
        OUT_OF_RADIUS_TAKEAWAY_AVAILABLE: "DI LUAR JANGKAUAN", // Pengambilan langsung tersedia meskipun di luar radius
        CLOSED_OUT_OF_TAKEAWAY_RADIUS: "CLOSED", // Tutup karena di luar radius pengambilan langsung
        CLOSED_TEMPORATY_CLOSED: "CLOSED", // Salah ejaan dari CLOSED_TEMPORARY_CLOSED
        CLOSED_TEMPORARY_CLOSED: "TUTUP SEMENTARA", // Restoran tutup sementara
        CLOSED_TEMPORATY_SCHEDULE_AVAILABLE: "", // Salah ejaan dari CLOSED_TEMPORARY_SCHEDULE_AVAILABLE
        CLOSED_TEMPORARY_SCHEDULE_AVAILABLE: "AKAN SEGERA BUKA", // Tutup sementara tetapi memiliki jadwal buka
        CLOSED_PRESALE_AVAILABLE: "CLOSED", // Tutup tetapi tersedia untuk pre-sale
        OPENED_SCHEDULE_ONLY: "SCHEDULE_ONLY", // Hanya buka berdasarkan jadwal tertentu
        OPENED_TAKEAWAY_ONLY: "TAKEAWAY_ONLY", // Hanya tersedia untuk pengambilan langsung
        CAPACITY_REACHED: "RESTAURANT FULL", // Kapasitas restoran telah penuh
        ALLOCATION_DELAY: "BUSY", // Penundaan alokasi pengiriman
        OUT_OF_RADIUS_TEMPORARILY_NEARBY: "OUT_OF_RADIUS_TEMPORARILY_NEARBY",
        OUT_OF_RADIUS_TEMPORARILY_FAR: "OUT_OF_RADIUS_TEMPORARILY_FAR", // Sementara di luar radius dan jauh
        OUT_OF_RADIUS_SUPPLY_CRUNCH_NO_SPU: "OUT_OF_RADIUS_SUPPLY_CRUNCH_NO_SPU", // Di luar radius karena kekurangan pasokan tanpa SPU
        OUT_OF_RADIUS_SUPPLY_CRUNCH_SPU: "OUT_OF_RADIUS_SUPPLY_CRUNCH_SPU", // Di luar radius karena kekurangan pasokan dengan SPU
        OUT_OF_DELIVERY_FEE: "OUT_OF_DELIVERY_FEE", // Di luar radius karena biaya pengiriman
    };

    const results = restaurants.map((merchant) => {
        const name = merchant?.address?.name || "Unknown";
        const latitude = merchant?.latlng?.latitude || "Unknown";
        const longitude = merchant?.latlng?.longitude || "Unknown";
        const photoHref = merchant?.merchantBrief?.photoHref || "Unknown";
        const distanceRaw = merchant?.merchantBrief?.distanceInKm || "Unknown";
        const distance =
            typeof distanceRaw === "number"
                ? distanceRaw.toFixed(1)
                : distanceRaw;
        const rating = merchant?.merchantBrief?.rating || "Belum ada rating";
        const status = merchant?.merchantStatusInfo?.status || "UNKNOWN";
        const translatedStatus = statusMapping[status] || "UNKNOWN";

        return {
            Alamat: photoHref,
            Nama: name,
            Opsi: `Resto\t\t:\r${translatedStatus}\nRating\t:\r${rating}\nJarak\t\t:\r${distance} km`,
            Tikor: `${latitude},${longitude}`,
        };
    });

    return { komo: results.length > 0 ? results : [] };
};

export default parseResponse;
