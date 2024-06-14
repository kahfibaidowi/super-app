import Layout from '@/Components/layout';
import { Link, Head, usePage } from '@inertiajs/react';
import { Formik } from 'formik';
import { useEffect, useState } from 'react';
import * as yup from "yup"
import { router } from '@inertiajs/react'
import clsx from 'clsx';
import * as _ from "underscore"


const appName=import.meta.env.SSD_HA

export default function Page(){
    const [login_form, setLoginForm]=useState({
        username:"",
        password:"",
        remember:false
    })
    const {errors}=usePage().props

    useEffect(()=>{
        //
    }, [errors])

    return (
        <div className="authentication-bg position-relative" style={{minHeight:"100vh"}}>
            <div class="account-pages pt-2 pt-sm-5 pb-4 pb-sm-5 position-relative">
                <div class="container">
                    <div class="row justify-content-center">
                        <div class="col-xxl-8 col-lg-10">
                            <div class="card overflow-hidden">
                                <div class="row g-0">
                                    <div class="col-lg-6 d-none d-lg-block p-2">
                                        <img src="/images/auth-img.jpg" alt="" class="img-fluid rounded h-100"/>
                                    </div>
                                    <div class="col-lg-6">
                                        <div class="d-flex flex-column h-100">
                                            <div class="auth-brand p-4">
                                                <a href="index.html" class="logo-light">
                                                    <img src="/images/logo.png" alt="logo" height="22"/>
                                                </a>
                                                <a href="index.html" class="logo-dark">
                                                    <img src="/images/logo-dark.png" alt="dark logo" height="22"/>
                                                </a>
                                            </div>
                                            <div class="p-4 my-auto">
                                                {errors?.type=="auth_fail"&&
                                                    <div className="alert alert-danger">
                                                        Login Gagal.!
                                                    </div>
                                                }
                                                <h4 class="fs-20">Sign In</h4>
                                                <p class="text-muted mb-3">
                                                    Enter your username and password to access account.
                                                </p>

                                                <Formik
                                                    initialValues={login_form}
                                                    validationSchema={
                                                        yup.object().shape({
                                                            username:yup.string().required(),
                                                            password:yup.string().required()
                                                        })
                                                    }
                                                    onSubmit={(values, actions)=>{
                                                        router.post("/login", values, {
                                                            onFinish:data=>{
                                                                actions.setSubmitting(false)
                                                            }
                                                        })
                                                    }}
                                                >
                                                    {formik=>(
                                                        <form onSubmit={formik.handleSubmit}>
                                                            <div class="mb-2">
                                                                <label for="emailaddress" class="form-label">Username</label>
                                                                <input 
                                                                    type="text" 
                                                                    className="form-control"
                                                                    placeholder="Username"
                                                                    value={formik.values.username}
                                                                    onChange={formik.handleChange}
                                                                    name="username"
                                                                />
                                                            </div>
                                                            <div class="mb-2">
                                                                <label for="password" class="form-label">Password</label>
                                                                <input
                                                                    type="password" 
                                                                    className="form-control"
                                                                    placeholder="Password"
                                                                    value={formik.values.password}
                                                                    onChange={formik.handleChange}
                                                                    name="password"
                                                                />
                                                            </div>
                                                            <div class="mb-2">
                                                                <div class="form-check">
                                                                    <input 
                                                                        type="checkbox" 
                                                                        class="form-check-input" 
                                                                        id="checkbox-signin"
                                                                        checked={formik.values.remember}
                                                                        onChange={()=>formik.setFieldValue("remember", !formik.values.remember)}
                                                                    />
                                                                    <label class="form-check-label" for="checkbox-signin">Remember me</label>
                                                                </div>
                                                            </div>
                                                            <div class="mb-0 text-start">
                                                                <button 
                                                                    class="btn btn-primary w-100" 
                                                                    type="submit"
                                                                    disabled={formik.isSubmitting||!(formik.dirty&&formik.isValid)}
                                                                >
                                                                    <span class="fw-bold">Log In</span>
                                                                </button>
                                                            </div>
                                                        </form>
                                                    )}
                                                </Formik>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
