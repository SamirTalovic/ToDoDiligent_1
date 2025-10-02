import { useField } from "formik";

interface Props {
    placeholder: string;
    name: string;
    rows: number;
    label?: string;
}

const CustomTextAreaInput = (props: Props) => {
    const [field, meta] = useField(props.name);
    
    return (
        <div className="textField">
            <label htmlFor={props.name}>{props.label}</label>
            <textarea
                {...field}
                {...props}
                className={`form-control shadow-none ${meta.touched && meta.error && "is-invalid"}`}
                placeholder={props.placeholder}
                autoComplete="off"
            />
            {meta.touched && meta.error ? (
                <div className="invalid-feedback">{meta.error}</div>
            ) : null}
        </div>
    )
}

export default CustomTextAreaInput;