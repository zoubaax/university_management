import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import Button from '../../../components/ui/Button';
import clubService from '../../../api/services/clubService';
import toast from 'react-hot-toast';

const ClubEvents = ({ events }) => {
    return (
        <div className="space-y-4">
            {events.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No events scheduled</p>
                    <p className="text-xs text-gray-400 mt-1">Check back soon!</p>
                </div>
            ) : (
                events.map((event) => (
                    <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
                    >
                        <div className="flex gap-4">
                            <div className="flex flex-col items-center justify-center w-16 h-16 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-[10px] font-bold text-blue-600 uppercase">
                                    {new Date(event.start_time).toLocaleString('default', { month: 'short' })}
                                </span>
                                <span className="text-xl font-bold text-blue-700 leading-none">
                                    {new Date(event.start_time).getDate()}
                                </span>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-semibold text-gray-900">{event.title}</h4>
                                <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Clock size={12} />
                                        {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MapPin size={12} />
                                        {event.location}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Users size={12} />
                                        {event.rsvp_count || 0} attending
                                    </div>
                                </div>
                                <Button
                                    size="xs"
                                    className="mt-3"
                                    onClick={() => clubService.rsvpToEvent(event.id).then(() => toast.success('RSVP confirmed!'))}
                                >
                                    RSVP
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                ))
            )}
        </div>
    );
};

export default ClubEvents;
