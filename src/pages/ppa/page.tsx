// @flow
import {getPPAIssueId, getPPAMailStatus, getPPANotBatchAll, JSONPPATypes} from "@/lib/ppa-api";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import {AgGridReact} from "ag-grid-react";
import "ag-grid-enterprise";
import React, {useMemo, useRef, useState} from "react";
import TaxEmail = JSONPPATypes.TaxEmail;
import {FaRegCalendarAlt, FaRegCheckCircle, FaRegAddressCard, FaRegBuilding } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/esm/locale";
import {format} from "date-fns";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export const getServerSideProps = async () => {
    const taxEmails: JSONPPATypes.TaxEmail[] = await getPPANotBatchAll("20220601", "20220601")
    return {
        props: {
            taxEmails
        },
    }
}

export default function Page({taxEmails}: {taxEmails: JSONPPATypes.TaxEmail[]}) {

    const gridRef = useRef<AgGridReact<TaxEmail>>(null);
    const [rowData, setRowData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const [selectDate, setSelectDate] = useState(new Date());

    //AG-GRID -------------------------------------------------------------------------
    let getRows = (params: []) => {
        const rows: [] = [];
        return rows;
    };

    const cell = (text: string, styleId: string) => {
        return {
            styleId: styleId,
            data: {
                type: /^\d+$/.test(text) ? 'Number' : 'String',
                value: String(text),
            },
        };
    };

    function currencyFormatter(currency: number) {
        let sansDec = currency.toFixed(0);
        let formatted = sansDec.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return `${formatted}`;
    }

    function taxNumFormatter(taxnum: string) {
        var formatted = taxnum.replace(/\B(?=(\d{8})+(?!\d))/g, '-');
        return `${formatted}`;
    }

    //console.log(taxNumFormatter('202206011000000093650848'))

    function mailStatusConvert(status: string) {
        return status === '01' ? '처리완료' : '미처리';
    }

    const [columnDefs, setColumnDefs] = useState(
        [
            {field: 'issueDay', headerName: '작성일', width: 100, resizable: true},
            {field: 'issueId',headerName: '국세청 승인번호',width: 230, resizable: true,
                valueFormatter: (params: any) => taxNumFormatter(params.data.issueId) },
            {field: 'invoicerPartyId', headerName: '사업자번호', width: 120, resizable: true},
            {field: 'invoicerAddr', headerName: '주 소', width: 500, resizable: true},
            {field: 'invoiceeTaxRegistId', headerName: '종사업장', width: 120, resizable: true},
            {field: 'chargeTotalAmount', headerName: '공급가', width: 110, resizable: true,
                valueFormatter: (params: any) => currencyFormatter(params.data.chargeTotalAmount), cellClass: 'ag-currency-text-right'},
            {field: 'taxTotalAmount', headerName: '세액', width: 110, resizable: true,
                valueFormatter:(params: any) => currencyFormatter(params.data.taxTotalAmount), cellClass: 'ag-currency-text-right' },
            {field: 'mailStatusCode', headerName: '처리상태', width: 120, resizable: true,
                valueFormatter: (params: any) => mailStatusConvert(params.data.mailStatusCode)}
        ]
    );

    const statusBar = useMemo(() => {
        return {
            statusPanels: [
                {
                    statusPanel: 'agTotalRowCountComponent',
                    align: 'right',
                }
            ],
        };
    },[]);
    //AG-GRID  --------------------------------------------------------------------------
    const [selectedDay, setSelectedDay] = useState<Date>();

    const footer = selectedDay ? (
        <p>You selected {format(selectedDay, 'PPP')}.</p>
    ) : (
        <p>Please pick a day.</p>
    );

    return (
        <>
            <header className="sticky top-0 bg-black shadow p-4">
                <h1 className="text-white text-2xl">PPA BATCH 조회</h1>
            </header>

            <main className="justify-center p-4">
                <div className="w-fit ml-40 border border-gray-300 m-3 p-4 grid grid-cols-1 gap-5 bg-white shadow-lg rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid grid-cols-2 gap-2 border border-gray-200 p-2 rounded">
                                <div className="flex border rounded bg-gray-300 items-center p-2 ">
                                    <FaRegCalendarAlt className="mr-2" />
                                    <DatePicker format="yyyy-MM-dd" />
                                    {/*<input type="text" placeholder="발행일 선택"*/}
                                    {/*       className="bg-gray-300 max-w-full focus:outline-none text-gray-700"/>*/}
                                </div>
                                <div className="flex border rounded bg-gray-300 items-center p-2 ">
                                    <FaRegCheckCircle className="mr-2" />
                                    <input type="text" placeholder="배치처리 여부"
                                           className="bg-gray-300 max-w-full focus:outline-none text-gray-700"/>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 border border-gray-200 p-2 rounded">
                                <div className="flex border rounded bg-gray-300 items-center p-2 ">
                                    <FaRegAddressCard className="mr-2" />
                                    <input type="text" placeholder="사업자번호 검색"
                                           className="bg-gray-300 max-w-full focus:outline-none text-gray-700"/>
                                </div>
                                <div className="flex border rounded bg-gray-300 items-center p-2 ">
                                   < FaRegBuilding className="mr-2" />
                                    <input type="text" placeholder="국세청 승인번호"
                                           className="bg-gray-300 max-w-full focus:outline-none text-gray-700"/>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button className="p-2 border w-1/6 rounded-md bg-gray-800 text-white">검 색</button>
                        </div>
                </div>
                <div className="ag-theme-alpine" style={{height: 600, width: 1420}}>
                    <AgGridReact<TaxEmail>
                        ref={gridRef}
                        rowData={taxEmails}
                        columnDefs={columnDefs}
                        animateRows={true}
                        statusBar={statusBar}
                    ></AgGridReact>
                </div>
            </main>
        </>
    )
}