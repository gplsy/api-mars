import prisma from "./prisma.js";

const createUserResponse = (user) => ({
    Device: user.device,
    Admin: user.admin,
    Expired: user.expired,
    Message: "komo",
});

const isUserExpired = (expirationDate) => new Date(expirationDate) < new Date();

const getUserByDevice = async (device) => {
    if (!prisma) throw new Error("Prisma client is not initialized.");
    return prisma.mars.findUnique({ where: { device } });
};

const updateUserStatus = (device, status) =>
    prisma.mars.update({
        where: { device },
        data: { status },
    });

export const auth = async (device) => {
    if (!device) return { error: "Device is required." };

    try {
        const user = await getUserByDevice(device);
        if (!user) return { error: "Please register first." };

        if (isUserExpired(user.expired)) {
            await updateUserStatus(device, false);
        }

        return { Mars: [createUserResponse(user)] };
    } catch (error) {
        return { error: `An error occurred: ${error.message}` };
    }
};

export const isExpired = async (device) => {
    if (!device) return { error: true, message: "Device is required." };

    try {
        const user = await getUserByDevice(device);
        if (!user) return { error: true, message: "User not found." };

        if (isUserExpired(user.expired)) {
            await updateUserStatus(device, false);
            return { error: true, message: "Please register first." };
        }

        return { error: false, message: "User is active." };
    } catch (error) {
        return { error: true, message: `An error occurred: ${error.message}` };
    }
};
