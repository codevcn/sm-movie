import { useState } from "react";
import axios from "axios";

const VideoUploader = () => {
   const [file, setFile] = useState(null);
   const [progress, setProgress] = useState(0);
   const [uploadSuccess, setUploadSuccess] = useState(false);

   const handleFileChange = (event) => {
      setFile(event.target.files[0]);
      setProgress(0); // Reset progress bar
      setUploadSuccess(false); // Reset success message
   };

   const handleUpload = async () => {
      if (!file) {
         alert("Please select a file first!");
         return;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
         const response = await axios.post(
            "http://localhost:5000/api/video/upload",
            formData,
            {
               headers: {
                  "Content-Type": "multipart/form-data",
               },
               onUploadProgress: (progressEvent) => {
                  // Tính toán phần trăm tiến trình
                  const percentCompleted = Math.round(
                     (progressEvent.loaded * 100) / progressEvent.total
                  );
                  setProgress(percentCompleted);
               },
            }
         );

         setUploadSuccess(true);
         alert("Upload successful!");
         console.log(response.data);
      } catch (error) {
         console.error("Error uploading video:", error);
         alert("Failed to upload video.");
      }
   };

   return (
      <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
         <h2>Upload Video</h2>
         <input type="file" accept="video/*" onChange={handleFileChange} />
         <button onClick={handleUpload} style={{ marginTop: "10px" }}>
            Upload
         </button>

         {progress > 0 && (
            <div style={{ marginTop: "20px" }}>
               <div
                  style={{
                     height: "20px",
                     background: "#ddd",
                     borderRadius: "5px",
                     overflow: "hidden",
                  }}
               >
                  <div
                     style={{
                        width: `${progress}%`,
                        height: "100%",
                        background: progress === 100 ? "green" : "blue",
                        transition: "width 0.2s",
                     }}
                  />
               </div>
               <p>{progress}%</p>
            </div>
         )}

         {uploadSuccess && (
            <p style={{ color: "green" }}>Upload completed successfully!</p>
         )}
      </div>
   );
};

export default VideoUploader;
