import axios from "axios";

export const uploadImage = async (img)=>{
    console.log("AWS: ", img)
    try {
        // Get signed upload URL from backend
        const {data: {uploadURL}} = await axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/get-upload-url?fileType=${img.type}`);

        // Upload image to S3
        await axios({
            method:"PUT",
            url:uploadURL,
            headers:{
                'Content-Type':img.type
            },
            data:img
        })

        // Remove query params from URL
        const imageURL = uploadURL.split("?")[0];

        return imageURL;
        
    } catch (error) {
        console.log("Image Upload Error: ", error.message);
        return null;
    }
}