import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import Alert from './Alert';

export default function FormValidation() {
    const { register, handleSubmit, resetField, formState: { errors } } = useForm();
    const [ message, setMessage ] = useState('')
    const [ dangerMessage, setDangerMessage ] = useState('')
    const [ isSending, setIsSending ] = useState(false)

    const onSubmit = (data) => {
        setIsSending(true)
        setMessage('')
        setDangerMessage('')

        let form_data = new FormData()
        for(let key in data) {
            form_data.append(key, data[key])
        }
        fetch("https://renthouse.danielraison.it/wp-json/contact-form-7/v1/contact-forms/5/feedback", {
            method: 'POST',
            body: form_data
        })
        .then(response => response.json())
        .then(response => {
            if(response.status == 'mail_sent') {
                setMessage(response.message)
                resetField('email')
                resetField('subject')
                resetField('message')
            } else {
                setDangerMessage('Something was wrong.')
            }
            setIsSending(false)
        })
        .catch((error) => {
            setIsSending(false)
            setDangerMessage('Error: '+error)
        });
    }
    return (
        <>
            {dangerMessage && <Alert type="danger" heading="Error" message={dangerMessage} /> }
            {message && <Alert type="success" heading="OK" message={message} />}
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-3">
                    <input
                      type="email"
                      placeholder="E-mail"
                      {...register("email", { required: "Email Address is required" })} 
                      aria-invalid={errors.mail ? "true" : "false"} 
                    />
                    {errors.email && <p className="text-danger mt-1"><small>Your e-mail address is wrong</small></p>}
                </div>

                <div className="mb-3">
                    <input
                        className="form-control"
                        type="text"
                        placeholder="Subject"
                        {...register("subject", { required: true, maxLength: 80 })}
                    />
                    {errors.subject && <p className="text-danger mt-1"><small>Your subject is wrong (max 80 chars)</small></p>}
                </div>

                <div className="mb-3">
                    <textarea
                        className="form-control"
                        rows="5"
                        placeholder="Message"
                        {...register("message", {
                            required: true,
                            maxlength: 1000
                        })}
                    ></textarea>
                    {errors.message && <p className="text-danger mt-1"><small>Your message is wrong (max 1000 chars)</small></p>}
                </div>
                <button type='submit' className="mt-3 btn btn-success w-100" disabled={isSending}>{isSending && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>} Submit</button>
            </form>
        </>
    )
}