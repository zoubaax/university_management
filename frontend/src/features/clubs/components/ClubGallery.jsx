import React from 'react';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';

const ClubGallery = ({ gallery }) => {
    return (
        <div className="grid grid-cols-2 gap-3">
            {gallery.length === 0 ? (
                <div className="col-span-2 text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No photos yet</p>
                    <p className="text-xs text-gray-400 mt-1">Check back for club memories!</p>
                </div>
            ) : (
                gallery.map((photo) => (
                    <motion.div
                        key={photo.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200"
                    >
                        <img
                            src={`${import.meta.env.VITE_API_URL}${photo.image_url}`}
                            alt={photo.caption}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        {photo.caption && (
                            <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                                <p className="text-[10px] text-white truncate">{photo.caption}</p>
                            </div>
                        )}
                    </motion.div>
                ))
            )}
        </div>
    );
};

export default ClubGallery;
