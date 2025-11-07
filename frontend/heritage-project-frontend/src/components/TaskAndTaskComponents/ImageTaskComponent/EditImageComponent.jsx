import React, { useState, useEffect, useCallback } from 'react';
import {useDropzone} from "react-dropzone"
import "../../../styles/Components/ImageComponent/ImageComponent.css"

import {
    Upload,
} from 'lucide-react';

function EditImageComponent ({image, setImage})  {

    //Create state for saving preview url
    const [previewImage, setPreview] = useState(typeof image === 'string' ? image : null);//Check if url already exists
    
    //Create function for handling when a file is added
    //Usecall back is a performance hook. Prevents react from rendering more than once.
    const onDrop = useCallback(givenFiles => {
        console.log(givenFiles);
        if (givenFiles.length === 0) {
            return;
        }

        const image = givenFiles[0];
        setImage(image);

        //Update preview url
        setPreview(URL.createObjectURL(image))
    }, [setImage]);//list setImage as a dependency since onDrop needs it

    //Set up clean up for rpeviosu image when we drop a new one
    useEffect(() => {
        return () => {
            //Clean up our temp blob urls
            if (previewImage && previewImage.startsWith('blob:')) {
                //clean up
                URL.revokeObjectURL(previewImage);
            }
        }
    }, [])

    //Set up dropzone
    const {
        getRootProps,//function that returns object of props
        getInputProps,
        isDragActive
    } = useDropzone({
        onDrop,//Function to run on drop
        accept: {'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg']},//Accept only these file types
        multiple: false//Only allow one image
    })

    return (
        <div {...getRootProps()} className='dropFrame'>
            <input {...getInputProps()} />
            {previewImage ? (
                //previewImage exists
                <img className='prevImage'
                    src={previewImage}
                    alt="Upload preview"
                />
            ) : (
                //No image added yet
                <div className='dropBox'>
                    <Upload className='uploadIcon' />
                    <p>Drag & Drop</p>
                    <p>or Click to <span className="browseLink">browse</span></p>
                </div>
            )}
        </div>
    );
};

export default EditImageComponent;