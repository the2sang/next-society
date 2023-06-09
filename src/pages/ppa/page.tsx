// @flow
import {
    getPPABatchAll,
    getPPAIssueId,
    getPPAMailStatus,
    getPPANotBatchAll,
    getPPASaupNo,
    JSONPPATypes
} from "@/lib/ppa-api";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import {AgGridReact} from "ag-grid-react";
import "ag-grid-enterprise";
import React, {useCallback, useMemo, useRef, useState} from "react";
import TaxEmail = JSONPPATypes.TaxEmail;
import {FaRegCalendarAlt, FaRegCheckCircle, FaRegAddressCard, FaRegBuilding } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import dayjs, { Dayjs } from 'dayjs';

export const getServerSideProps = async () => {
    const taxEmails: JSONPPATypes.TaxEmail[] = await getPPANotBatchAll("20210317", "20210317")
    return {
        props: {
            taxEmails
        },
    }
}

export default function Page({taxEmails}: {taxEmails: JSONPPATypes.TaxEmail[]}) {

    const gridRef = useRef<AgGridReact<TaxEmail>>(null);
    const [rowData, setRowData] = useState<TaxEmail[]>([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectDate, setSelectDate] = useState(new Date());

    const [saupNo, setSaupNo] = useState<string>("");
    const [issueId, setIssueId] = useState<string>("");
    const [batchYn, setBatchYn] = React.useState<string>("1");
    const [selectedIssueDay, setSelectedIssueDay] = React.useState<Dayjs | null>(null);

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




    const handleChange = (event: SelectChangeEvent) => {
        setBatchYn(event.target.value);
    };

    const searchPPA =  async () => {



        if (saupNo.trim().length !== 0 && issueId.trim().length !== 0) {
            alert("사업자번호와 국세청 승인번호 중 하나만 등록한 후 검색하세요")
            return
        }

        if (saupNo.trim().length !== 0) {
            const res = await getPPASaupNo(saupNo)
            gridRef.current?.api.setRowData(res)
        }

        if (issueId.trim().length !== 0) {
            const res = await getPPAIssueId(issueId)
            gridRef.current?.api.setRowData(res)
        }



        //console.log(dateFormat)
        //const response =  await getPPANotBatchAll(dateFormat, dateFormat)
        //console.log(response)
        //gridRef.current?.api.setRowData(rowData)

    }

    const searchPPAForDate = async () => {
        console.log(typeof batchYn)
        //let batchCheck:string = batchYn;
        //console.log(selectedIssueDay)
        if (selectedIssueDay === null) {
            alert("발행일자를 선택하세요.")
            return
        }
        const dateFormat = dayjs(selectedIssueDay).format("YYYYMMDD")

        //console.log('batchYn:' + batchYn)

        if (Number(batchYn) > 0) {
            //미처리
            console.log('처리완료')
            const response =  await getPPABatchAll(dateFormat, dateFormat)

            console.log(response)
            if (response.length === 0) alert("검색된 데이터가 없습니다.")
            gridRef.current?.api.setRowData(response)
        } else {
            //처리완료
            console.log('미처리')
            const response =  await getPPANotBatchAll(dateFormat, dateFormat)
            console.log(response)
            if (response.length === 0) alert("검색된 데이터가 없습니다.")
            gridRef.current?.api.setRowData(response)
        }



    }



    const onChangeSaupNo = (event:React.ChangeEvent<HTMLInputElement>) => {
        //event.preventDefault()
        console.log(event.target.value)
        setSaupNo(event.target.value)
    }

    const onChangeIssueId = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log(event.target.value)
        setIssueId(event.target.value)
    }



    return (
        <>
            <header className="sticky top-0 bg-black shadow p-4">
                <h1 className="text-white text-2xl">PPA BATCH 조회</h1>
            </header>

            <main className="w-fit justify-center p-2">
                <div className="ml-1 border border-gray-300 m-3 p-2 grid grid-cols-1 gap-5 bg-white shadow-lg rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid grid-cols-2 gap-2 border border-gray-200 p-2 rounded">
                                <div className="flex bg-white border rounded bg-gray-300 items-center p-2 ">
                                    <FaRegCalendarAlt className="mr-2" />
                                    <DatePicker
                                      value={selectedIssueDay}
                                      onChange={(newValue) => setSelectedIssueDay(newValue)}
                                      //defaultValue={dayjs('2023-04-17')}
                                      format="yyyy-MM-dd"
                                      label={"발행일자"}
                                      className="bg-white"
                                    />
                                    {/*<input type="text" placeholder="발행일 선택"*/}
                                    {/*       className="bg-gray-300 max-w-full focus:outline-none text-gray-700"/>*/}
                                </div>
                                <div className="flex bg-white border rounded bg-gray-300 items-center p-2 ">
                                    <FaRegCheckCircle className="mr-2" />
                                    배치처리여부
                                    <div>
                                        <FormControl sx={{ m: 1, minWidth: 150 }} size="small">
                                            <InputLabel id="default-label">선택</InputLabel>
                                            <Select
                                              labelId="default-label"
                                              id="demo-select-small"
                                              value={batchYn}
                                              defaultValue="1"
                                              onChange={handleChange}
                                            >
                                                <MenuItem value={1}>처리완료</MenuItem>
                                                <MenuItem value={0}>미처리</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button onClick={searchPPAForDate}
                                            className="inline-block px-12 py-1 font-medium leading-6 text-center
                                    text-blue-700  transition bg-transparent border-2 border-blue-500 rounded-2xl
                                    shadow ripple hover:shadow-lg hover:bg-blue-200 focus:outline-none">검  색</button>
                                </div>
                            </div>
                            <div className="grid bg-white grid-cols-2 gap-2 border border-gray-200 p-2 rounded">
                                <div className="flex bg-white border rounded bg-gray-300 items-center p-2 ">
                                    <FaRegAddressCard className="mr-2" />
                                    <input type="text" placeholder="사업자번호" name="saupNo" onChange={onChangeSaupNo}
                                           className="bg-gray-50 border border-gray-500  dark:text-white-400  text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-green-500"/>
                                </div>
                                <div className="flex bg-white border rounded bg-gray-300 items-center p-2 ">
                                   < FaRegBuilding className="mr-2" />
                                    <input type="text" placeholder="국세청 승인번호" onChange={onChangeIssueId}
                                           className="bg-gray-50 border border-gray-500  dark:text-white-400  text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-green-500"/>
                                </div>
                                <div className="flex justify-end">
                                    <button onClick={searchPPA}
                                            className="inline-block px-12 py-1 font-medium leading-6 text-center
                                    text-blue-700  transition bg-transparent border-2 border-blue-500 rounded-2xl
                                    shadow ripple hover:shadow-lg hover:bg-blue-200 focus:outline-none">검  색</button>
                                </div>

                            </div>
                        </div>
                        {/*<div className="flex justify-center">*/}
                        {/*    <button onClick={searchPPAForDate} */}
                        {/*            className="justify-start inline-block px-12 py-1 font-medium leading-6 text-center text-blue-700 */}
                        {/*            transition bg-transparent border-2 border-blue-500 rounded-2xl shadow ripple hover:shadow-lg */}
                        {/*            hover:bg-blue-200 focus:outline-none">검  색</button>*/}
                        {/*    <button onClick={searchPPA} */}
                        {/*            className="justify-end inline-block px-12 py-1 font-medium leading-6 text-center */}
                        {/*            text-blue-700  transition bg-transparent border-2 border-blue-500 rounded-2xl */}
                        {/*            shadow ripple hover:shadow-lg hover:bg-blue-200 focus:outline-none">검  색</button>*/}
                        {/*</div>*/}

                </div>
                <div className="ag-theme-alpine" style={{ height: 600, width: 1420}}>
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