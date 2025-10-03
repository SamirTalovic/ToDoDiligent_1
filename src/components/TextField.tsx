import React from 'react';
import { ErrorMessage, useField, FieldAttributes } from 'formik';

interface Props extends FieldAttributes<any> {
  label: string;
}

export const TextField: React.FC<Props> = ({ label, ...props }) => {
  const [field, meta] = useField(props.name);

  return (
    <div className="mb-2">
      <label htmlFor={field.name}>{label}</label>
      <input
        className={`form-control shadow-none ${meta.touched && meta.error && 'is-invalid'}`}
        {...field} {...props}
        autoComplete="off"
      />
      <ErrorMessage component="div" name={field.name} className="error" />
    </div>
  )
}