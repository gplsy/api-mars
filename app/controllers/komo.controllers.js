import { apiService } from "../services/komo.services.js";

export const moko = (req, res) => {
    return res.status(200).json({
        status: "online",
        message: "Please register first.",
    });
};

export const controllers = async (req, res) => {
    const data = req.headers;

    try {
        const result = await apiService(data);
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.statusCode || 400;
        return res
            .status(statusCode)
            .json({ error: error.message || "An unexpected error occurred." });
    }
};
