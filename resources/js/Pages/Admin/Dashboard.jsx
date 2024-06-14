import Layout from '@/Components/layout'
import { router, usePage } from '@inertiajs/react'
import axios from 'axios'
import { List, Map } from 'immutable'
import React from 'react'

export default function Page(){

    return (
        <Layout>
            {/* {usePage().url}

            {/* <div class="scrollable-y">
                <table className="table table-bordered table-sm">
                    <thead style={{background:"#00f", position:"sticky", top:"70px"}}>
                    <tr><th>TH 1</th><th>TH 2</th></tr>
                    </thead>
                    <tbody>
                    {Array.apply("", Array(50)).map(d=>(
                        <>
                        <tr>
                            <td>A1</td><td>A2</td></tr>
                            <tr><td>B1</td><td>B2</td></tr>
                            <tr><td>C1</td><td>C2</td></tr>
                            <tr><td>D1</td><td>D2</td></tr>
                            <tr><td>E1</td><td>E2</td></tr>
                        </>
                    ))}
                    </tbody>
                </table>
            </div> */}
        </Layout>
    )
}
