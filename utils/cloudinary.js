const cloudinary = require('cloudinary').v2;


const {
    CLOUD_NAME,
    API_KEY,
    API_SECRET,
} = process.env;

if (CLOUD_NAME && API_KEY && API_SECRET) {
    cloudinary.config({
        cloud_name: CLOUD_NAME,
        api_key: API_KEY,
        api_secret: API_SECRET,
    });
} else {
    // console.warn("Cloudinary environment variables are missing.");
}

const uploadTheImage = async (localFilePath) => {
    try {
        const response = await cloudinary.uploader.upload(localFilePath, {
            folder: 'vyapari',
            resource_type: 'auto'
        });
        // console.log("Uploaded:", response?.secure_url);
        return response;
    } catch (error) {
        // console.error("Upload error:", error);
        return null;
    }
};

module.exports = uploadTheImage;