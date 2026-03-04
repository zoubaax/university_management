import React from 'react';
import { motion } from 'framer-motion';
import { Megaphone } from 'lucide-react';

const ClubAnnouncements = ({ broadcasts }) => {
    return (
        <div className="space-y-4">
            {broadcasts.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No announcements yet</p>
                    <p className="text-xs text-gray-400 mt-1">Stay tuned for updates!</p>
                </div>
            ) : (
                broadcasts.map((broadcast) => (
                    <motion.div
                        key={broadcast.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="text-sm font-semibold text-gray-900">{broadcast.subject}</h4>
                            <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                                {new Date(broadcast.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">
                            {broadcast.body}
                        </p>
                    </motion.div>
                ))
            )}
        </div>
    );
};

export default ClubAnnouncements;
