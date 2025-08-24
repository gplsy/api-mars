const fallback = "Unknown";
const getOrUnknown = (value) => value ?? fallback;

const formatCoordinates = (lat, long) =>
    lat && long ? `${lat},${long}` : fallback;

export const parseResponse = (data) => {
    if (!data || typeof data !== "object") {
        throw new Error("Invalid response data");
    }

    const cards = Array.isArray(data.data?.cards) ? data.data.cards : [];

    const komo = cards.map((card) => {
        const content = card.content || {};
        const otherInfo = content.other_info || {};

        return {
            Alamat: getOrUnknown(content.image_url),
            Nama: getOrUnknown(content.title?.text),
            Opsi: `Resto\t\t:\r${getOrUnknown(otherInfo.availability?.code)}\nRating\t:\r${content.image_overlay?.text ?? "Belum ada rating"}\nJarak\t\t:\r${(getOrUnknown(content.additional_info?.normal_text)).replace(/•/g, "").trim()}`,
            Tikor: getOrUnknown(otherInfo.location),
        };
    });

    return { komo };
};

export const parseDrivers = (drivers) => {
    if (!Array.isArray(drivers)) {
        throw new Error("Invalid drivers data: Expected an array.");
    }

    const komo = drivers.map((driver) => ({
        Nama: getOrUnknown(driver["driver-attributes"]?.["vehicle-plate-number"]),
        Tikor: getOrUnknown(driver.driverLatLong),
    }));

    return { komo };
};

export const parseResponsePickup = (data) => {
    if (!data?.data) {
        console.warn("Data tidak valid.");
        return { komo: [] };
    }

    const { type, places, source_location } = data.data;
    let komo = [];

    const buildEntry = (name, address, lat, long) => ({
        Nama: getOrUnknown(name),
        Alamat: address,
        Opsi: "",
        Tikor: formatCoordinates(lat, long),
    });

    if (type === "ppoi" && Array.isArray(places)) {
        komo = places.map(p => buildEntry(p.name, p.address, p.latitude, p.longitude));
    } else if (type === "reverse_geocode" && source_location) {
        komo = [buildEntry(source_location.name, source_location.address, source_location.latitude, source_location.longitude)];
    } else if (type === "ppoi" && Array.isArray(source_location?.vertices)) {
        komo = source_location.vertices.map(vertex =>
            buildEntry(source_location.name, source_location.address, vertex.latitude, vertex.longitude)
        );
    }

    if (komo.length === 0) console.warn("Tidak ada data koordinat yang bisa diparsing.");
    return { komo };
};

export const extractCoordinates = (data) => {
    if (!data) {
        console.warn("Data kosong atau tidak valid.");
        return { komo: [] };
    }

    const komo = [];

    const buildEntry = (name, address, lat, long) => ({
        Nama: getOrUnknown(name),
        Alamat: address,
        Opsi: "",
        Tikor: formatCoordinates(lat, long),
    });

    const { data: innerData } = data;

    if (innerData) {
        const { type, places, source_location } = innerData;

        if (type === "ppoi" && Array.isArray(places)) {
            return {
                komo: places.map(p => buildEntry(p.name, p.address, p.latitude, p.longitude)),
            };
        }

        if (type === "reverse_geocode" && source_location) {
            return {
                komo: [buildEntry(source_location.name, source_location.address, source_location.latitude, source_location.longitude)],
            };
        }

        if (type === "ppoi" && Array.isArray(source_location?.vertices)) {
            return {
                komo: source_location.vertices.map(vertex =>
                    buildEntry(source_location.name, source_location.address, vertex.latitude, vertex.longitude)
                ),
            };
        }
    }

    if (Array.isArray(data.result)) {
        data.result.forEach(place => {
            if (Array.isArray(place.gates) && place.gates.length > 0) {
                place.gates.forEach(gate => {
                    komo.push(buildEntry(gate.name || place.name, place.address || gate.address, gate.latitude, gate.longitude));
                });
            } else {
                komo.push(buildEntry(place.name, place.address, place.latitude, place.longitude));
            }
        });

        return { komo };
    }

    console.warn("Tidak ditemukan data koordinat dari struktur yang dikenali.");
    return { komo: [] };
};