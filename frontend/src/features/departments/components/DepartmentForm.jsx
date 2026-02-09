import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

import Input from '../../../components/ui/Input';
import Textarea from '../../../components/ui/Textarea';
import Button from '../../../components/ui/Button';

const departmentSchema = z.object({
    name: z.string().min(2, 'Department name must be at least 2 characters'),
    description: z.string().optional(),
});

const DepartmentForm = ({ initialValues, onSubmit, onCancel }) => {
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(departmentSchema),
        defaultValues: {
            name: '',
            description: ''
        }
    });

    useEffect(() => {
        if (initialValues) {
            setValue('name', initialValues.name);
            setValue('description', initialValues.description || '');
        } else {
            reset({ name: '', description: '' });
        }
    }, [initialValues, setValue, reset]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
                label="Department Name"
                placeholder="e.g. Computer Science"
                {...register('name')}
                error={errors.name?.message}
            />

            <Textarea
                label="Description"
                placeholder="Describe the department's focus..."
                {...register('description')}
                error={errors.description?.message}
            />

            <div className="flex gap-4 pt-4">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    className="flex-1"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    isLoading={isSubmitting}
                    className="flex-1"
                >
                    {initialValues ? 'Save Changes' : 'Create'}
                </Button>
            </div>
        </form>
    );
};

export default DepartmentForm;
