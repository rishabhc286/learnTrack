import { useState, useEffect } from 'react';
import { getToday } from '../../utils/helpers';

export default function RoadmapForm({ onSubmit, onCancel, initialData }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    targetDate: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || '',
        description: initialData.description || '',
        targetDate: initialData.targetDate
          ? initialData.targetDate.split('T')[0]
          : '',
      });
    }
  }, [initialData]);

  function validate() {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      targetDate: form.targetDate || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => {
            setForm({ ...form, title: e.target.value });
            setErrors({ ...errors, title: '' });
          }}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., Full Stack Java Developer"
        />
        {errors.title && (
          <p className="text-red-500 text-xs mt-1">{errors.title}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
          placeholder="Describe your learning roadmap..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Target Date
        </label>
        <input
          type="date"
          value={form.targetDate}
          min={getToday()}
          onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {initialData ? 'Update Roadmap' : 'Create Roadmap'}
        </button>
      </div>
    </form>
  );
}
