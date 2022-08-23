const db = require("../config/connectDB");
const response = require("../utils/response");
const LOGGER = require("../utils/logger");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            auth_type: "local",
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "7d",
        }
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            auth_type: "local",
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: "60d",
        }
    );
};

module.exports.createUser = async (data) => {
    try {
        const connection = db("user");
        const { email, password, displayName } = data;

        if (email.length < 6 || password.length < 6) {
            return response.ERROR(500, "Mật khẩu phải có ít nhất 6 ký tự");
        }
        const existingUser = await connection
            .clone()
            .where({ email: email.trim() })
            .first();
        if (existingUser) {
            return response.WARN(400, "Email has already existed!", "user_002");
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        //Create new User
        const dataToCreate = {
            email,
            password: hashPassword,
            display_name: displayName,
            is_delete: false,
        };
        const [id] = await connection.clone().insert(dataToCreate, ["id"]);

        LOGGER.APP.info("id user inserted ", id);
        return response.SUCCESS(200, "Create user successfully");
    } catch (error) {
        LOGGER.DB.error(error);
        return response.ERROR(500, "Lỗi server");
    }
};

//LOGIN
module.exports.signIn = async (data) => {
    try {
        let accessToken = "";
        let refreshToken = "";
        const basicInfo = {};

        const connection = db("user");
        const { email, password } = data;

        const user = await connection.where({ email: email.trim() }).first();
        if (!user) {
            return response.WARN(400, "Email is not existed!", "user_001");
        }
        if (user.is_delete == true) {
            return response.ERROR(500, "Account not found", "user_002");
        }

        const validPassword = await bcrypt.compareSync(password, user.password);
        if (!validPassword) {
            return response.WARN(400, "Invalid password!", "user_003");
        }

        if(user && (user.access_token && user.refresh_token) !== null){
            const dataToBeSent = {
                id: user.id,
                displayName: user.display_name,
                email: user.email,
                authType: user.auth_type,
                accessToken: user.access_token,
                refreshToken: user.refresh_token,
                isDelete: user.is_delete
            };
            return response.SUCCESS("Login successfully", dataToBeSent);
        }else{
            accessToken = generateAccessToken(user);
            refreshToken = generateRefreshToken(user);
            basicInfo.access_token = accessToken;
            basicInfo.refresh_token = refreshToken;
            await connection.update(basicInfo).where({ id: user.id });
        }

        const dataToBeSent = {
            id: user.id,
            displayName: user.display_name,
            email: user.email,
            authType: user.auth_type,
            accessToken: accessToken,
            refreshToken: refreshToken,
            isDelete: user.is_delete
        };

        return response.SUCCESS("Login successfully", dataToBeSent);
    } catch (error) {
        LOGGER.DB.error(error);
        return response.ERROR(500, "Lỗi server");
    }
};

module.exports.refreshToken = async (dataUser) => {
    try {
        const userId = dataUser.id;
        const email = dataUser.email;
        const authGoogleId = dataUser.auth_google_id;
        const authFacebookId = dataUser.auth_facebook_id;

        const basicInfo = { update_time: new Date() };

        const newAccessToken = jwt.sign(
            {
                id: userId,
                auth_google_id: authGoogleId,
                auth_facebook_id: authFacebookId,
                email,
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: "7d",
            }
        );
        basicInfo.access_token = newAccessToken;

        await db("user").update(basicInfo).where({ id: userId });
        return response.SUCCESS("Refresh token successfully", { accessToken: newAccessToken });
    } catch (error) {
        console.log(error);
        LOGGER.DB.error(error);
        return response.ERROR(500, "RefreshToken failed");
    }
};
