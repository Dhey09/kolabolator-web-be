import UserRole from "../models/UserRoleModel.js";

export const createUserRole = async (req, res) => {
    try {
        const userRole = await UserRole.create({ role: req.body.role });
        res.status(201).json(userRole);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}


export const getUserRoles = async (req, res) => {
    try {
        const userRoles = await UserRole.findAll();
        res.status(200).json(userRoles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


export const getUserRoleById = async (req, res) => {
    try {
        const userRole = await UserRole.findOne({ where: { uuid: req.params.id } });
        if (!userRole) return res.status(404).json({ message: "User Role not found" });
        res.status(200).json(userRole);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


export const updateUserRole = async (req, res) => {
    try {
        const userRole = await UserRole.findOne({ where: { uuid: req.params.id } });
        if (!userRole) return res.status(404).json({ message: "User Role not found" });
        userRole.role = req.body.role;
        await userRole.save();
        res.status(200).json({ message: "User Role updated successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}


export const deleteUserRole = async (req, res) => {
    try {
        const userRole = await UserRole.findOne({ where: { uuid: req.params.id } });    
        if (!userRole) return res.status(404).json({ message: "User Role not found" });
        await userRole.destroy();
        res.status(200).json({ message: "User Role deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}