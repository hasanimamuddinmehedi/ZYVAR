import axios from "axios";

const CLOUD_NAME = "dhppdatrl";
const UPLOAD_PRESET = "zyvar_upload";

export const uploadImage = async (imageFile) => {

  try {

    const formData = new FormData();

    formData.append("file", imageFile);

    formData.append(
      "upload_preset",
      UPLOAD_PRESET
    );

    const response = await axios.post(

      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,

      formData,

      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

    console.log(
      "Cloudinary Response:",
      response.data
    );

    return response.data.secure_url;

  } catch (error) {

    console.log(
      "Cloudinary Error:",
      error.response?.data || error
    );

    return null;
  }
};