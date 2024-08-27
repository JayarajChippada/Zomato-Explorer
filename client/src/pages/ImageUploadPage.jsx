import React, { useState } from 'react';
import axios from 'axios';

const ImageSearchPage = () => {
    const [image, setImage] = useState(null);
    const [labels, setLabels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!image) return;

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('image', image);

        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64Image = reader.result.split(',')[1];

                const response = await axios.post(
                    'https://api.clarifai.com/v2/models/food-item-recognition/outputs',
                    {
                        inputs: [
                            {
                                data: {
                                    image: {
                                        base64: base64Image
                                    }
                                }
                            }
                        ]
                    },
                    {
                        headers: {
                            'Authorization': `3de1b64ea5b6463ab7b7ac72473708ec`,
                            'Content-Type': 'application/json'
                        }   
                    }
                );

                const labels = response.data.outputs[0].data.concepts.map(concept => concept.name);
                setLabels(labels);
            };
            reader.readAsDataURL(image);
        } catch (error) {
            setError('Error uploading image or fetching labels.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
            <h1 className="text-3xl font-bold mb-6">Upload Food Image</h1>
            <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mb-4 w-full text-gray-700"
                />
                <button
                    onClick={handleUpload}
                    disabled={loading}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                    {loading ? 'Uploading...' : 'Upload Image'}
                </button>
                {error && <p className="mt-4 text-red-500">{error}</p>}
                {labels.length > 0 && (
                    <div className="mt-6">
                        <h2 className="text-2xl font-semibold mb-2">Detected Labels</h2>
                        <ul className="list-disc list-inside pl-4">
                            {labels.map((label, index) => (
                                <li key={index} className="text-gray-700">{label}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageSearchPage;
