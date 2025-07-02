import React, { useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Box, Typography, IconButton } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";

const DragAndDropUploader = ({ files, onDrop, removeFile }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const filesWithPreview = acceptedFiles.map((file) =>
        Object.assign(file, { preview: URL.createObjectURL(file) })
      );
      console.log("Accepted Files:", filesWithPreview); // Debugging
      onDrop(filesWithPreview); // Ensure parent updates state
    },
    accept: { "image/*": [] }, // Ensure correct file type handling
    multiple: true,
  });

  // Cleanup previews when component unmounts
  useEffect(() => {
    files.forEach((file) => {
      if (file.preview) URL.revokeObjectURL(file.preview);
    });
  }, [files]);

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      {/* Drag-and-Drop Zone */}
      <Box
        {...getRootProps()}
        sx={{
          border: "2px dashed #003366",
          borderRadius: "10px",
          p: 4,
          textAlign: "center",
          backgroundColor: isDragActive ? "#E6F7FF" : "#F9F9F9",
          transition: "background-color 0.3s",
          cursor: "pointer",
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <Typography color="primary" variant="h6">
            Déposez vos fichiers ici...
          </Typography>
        ) : (
          <>
            <UploadFileIcon color="primary" fontSize="large" />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Glissez-déposez vos fichiers ici ou cliquez pour les télécharger
            </Typography>
          </>
        )}
      </Box>

      {/* Preview Section */}
      {files.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            mt: 3,
            p: 2,
            border: "1px solid #e0e0e0",
            borderRadius: "10px",
          }}
        >
          {files.map((file, index) => {
            console.log("Rendering file:", file); // Debugging
            return (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                  width: "120px",
                  textAlign: "center",
                }}
              >
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.name}
                    style={{
                      width: "100%",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                ) : (
                  <Typography color="error">Preview not available</Typography>
                )}

                <IconButton
                  color="error"
                  size="small"
                  onClick={() => removeFile(file.name)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default DragAndDropUploader;
