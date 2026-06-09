'use client'

interface FormTextareaProps {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  rows?: number
  placeholder?: string
  required?: boolean
}

export default function FormTextarea({ label, name, value, onChange, rows = 4, placeholder, required }: FormTextareaProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        className="w-full px-3 py-2 border border-stone-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] bg-stone-50 text-sm"
        placeholder={placeholder}
        required={required}
      />
    </div>
  )
}

