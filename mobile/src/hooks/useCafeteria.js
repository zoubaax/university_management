import { useState, useEffect, useCallback } from 'react';
import api from '../api/api';

/**
 * Hook to manage menu items
 */
export const useMenu = (category = 'ALL') => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const response = await api.get('/cafeteria/items?is_available=true');
            setItems(response.data.data);
        } catch (error) {
            console.error('Failed to fetch menu:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const filteredItems = items.filter(item =>
        category === 'ALL' || item.category === category
    );

    return { items, filteredItems, loading, refresh: fetchItems };
};

/**
 * Hook to manage student orders
 */
export const useOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/cafeteria/orders');
            setOrders(response.data.data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 30000);
        return () => clearInterval(interval);
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchOrders();
    }, []);

    const placeOrder = async (orderData) => {
        return api.post('/cafeteria/orders', orderData);
    };

    return { orders, loading, refreshing, onRefresh, placeOrder };
};
