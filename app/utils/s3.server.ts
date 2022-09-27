import type {UploadHandler} from "@remix-run/node";
import {unstable_parseMultipartFormData} from "@remix-run/node";
import S3 from "aws-sdk/clients/s3";
import cuid from "cuid";


const s3 = new S3({
    region: process.env.CHEER_BUCKET_REGION,
    accessKeyId: process.env.CHEER_ACCESS_KEY_ID,
    secretAccessKey: process.env.CHEER_SECRET_ACCESS_KEY,
});
  
const uploadHandler: UploadHandler = async ({ name, filename, stream }) => {
    if (name !== "files") {
      stream.resume();
      return;
    }
  
    const { Location } = await s3.upload({
        Bucket: process.env.CHEER_BUCKET_NAME || "",
        Key: `${cuid()}.${filename.split(".").slice(-1)}`,
        Body: stream,
      })
      .promise();
  
    return Location;
  };
export async function uploadAvatar(request: Request) {
    const formData = await unstable_parseMultipartFormData(
      request,
      uploadHandler
    );
  
    const file = formData.get("profile-pic")?.toString() || "";
  
    return file;
  }