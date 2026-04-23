"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useLanguage } from "@/components/providers"
import { Users, ArrowLeft, Search, CheckCircle, XCircle, Snowflake, ClipboardCheck, Loader2 } from "lucide-react"
import { toast } from "sonner"

type Customer = {
  id: number
  email: string
  registration_data: Record<string, string>
  created_at: string
  stamp_count: string
  ice_bath_registered: boolean | null
  ice_bath_time: string | null
  pre_survey_completed: boolean | null
  post_survey_completed: boolean | null
}

type Booth = {
  id: number
  name_en: string
  name_th: string
}

type CustomerWithStamps = Customer & { stamped_booths: number[] }

export function CustomersClient({ customers, booths }: { customers: Customer[], booths: Booth[] }) {
  const { t, lang } = useLanguage()
  const [search, setSearch] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithStamps | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [customerList, setCustomerList] = useState<Customer[]>(customers)

  useEffect(() => {
    setCustomerList(customers)
  }, [customers])

  const filteredCustomers = customerList.filter(c => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return c.email.toLowerCase().includes(searchLower) ||
      (c.registration_data && JSON.stringify(c.registration_data).toLowerCase().includes(searchLower))
  })

  const openCustomer = async (customer: Customer) => {
    try {
      const res = await fetch(`/api/staff/customers/${customer.id}/stamps`)
      const data = await res.json()
      setSelectedCustomer({ ...customer, stamped_booths: data.stamps || [] })
    } catch {
      setSelectedCustomer({ ...customer, stamped_booths: [] })
    }
  }

  const handleToggleStamp = async (boothId: number) => {
    if (!selectedCustomer) return
    
    const stamped = selectedCustomer.stamped_booths.includes(boothId)
    const method = stamped ? "DELETE" : "POST"
    
    try {
      const url = `/api/staff/customers/${selectedCustomer.id}/stamps${stamped ? `?boothId=${boothId}` : ''}`
      
      const res = await fetch(url, {
        method,
        headers: method === "POST" ? { "Content-Type": "application/json" } : {},
        body: method === "POST" ? JSON.stringify({ boothId }) : undefined
      })
      
      if (res.ok) {
        if (stamped) {
          selectedCustomer.stamped_booths = selectedCustomer.stamped_booths.filter(id => id !== boothId)
          selectedCustomer.stamp_count = String(parseInt(selectedCustomer.stamp_count) - 1)
        } else {
          selectedCustomer.stamped_booths.push(boothId)
          selectedCustomer.stamp_count = String(parseInt(selectedCustomer.stamp_count) + 1)
        }
        setSelectedCustomer({ ...selectedCustomer })
        
        setCustomerList(customerList.map(c => 
          c.id === selectedCustomer.id 
            ? { ...c, stamp_count: selectedCustomer.stamp_count }
            : c
        ))
        toast.success(lang === "th" ? "บันทึกสำเร็จ!" : "Saved!")
      } else {
        toast.error(lang === "th" ? "เกิดข้อผิดพลาด" : "Error")
      }
    } catch {
      toast.error(lang === "th" ? "เกิดข้อผิดพลาด" : "Error")
    }
  }

  const handleToggleField = async (field: string, value: boolean) => {
    if (!selectedCustomer) return
    
    setIsSaving(true)
    try {
      const res = await fetch(`/api/staff/customers/${selectedCustomer.id}/field`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, value })
      })
      
      if (res.ok) {
        if (field === 'ice_bath_registered') {
          selectedCustomer.ice_bath_registered = value
        } else if (field === 'pre_survey_completed') {
          selectedCustomer.pre_survey_completed = value
        } else if (field === 'post_survey_completed') {
          selectedCustomer.post_survey_completed = value
        }
        setSelectedCustomer({ ...selectedCustomer })
        
        setCustomerList(customerList.map(c => 
          c.id === selectedCustomer.id 
            ? { ...c, [field]: value }
            : c
        ))
        toast.success(lang === "th" ? "บันทึกสำเร็จ!" : "Saved!")
      } else {
        toast.error(lang === "th" ? "เกิดข้อผิดพลาด" : "Error")
      }
    } catch {
      toast.error(lang === "th" ? "เกิดข้อผิดพลาด" : "Error")
    }
    setIsSaving(false)
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/staff/dashboard" className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">{t("customers")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{filteredCustomers.length} {lang === "th" ? "คน" : "total"}</p>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder={lang === "th" ? "ค้นหาลูกค้า..." : "Search customers..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-card text-sm"
        />
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="flex flex-col items-center text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">{t("noCustomers")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCustomers.map((c) => (
            <div
              key={c.id}
              onClick={() => openCustomer(c)}
              className="p-4 rounded-xl border border-border bg-card cursor-pointer hover:border-primary transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{c.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {c.stamp_count} {lang === "th" ? "แสตมป์" : "stamps"}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {c.ice_bath_registered ? (
                    <Snowflake className="h-4 w-4 text-blue-400" />
                  ) : null}
                  {c.pre_survey_completed ? (
                    <ClipboardCheck className="h-4 w-4 text-green-400" />
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg truncate">{selectedCustomer.email}</h2>
              <button onClick={() => setSelectedCustomer(null)} className="p-2 text-muted-foreground hover:text-foreground shrink-0">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Ice Bath */}
              <div className="p-4 rounded-xl border border-border bg-secondary/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Snowflake className="h-5 w-5 text-blue-400" />
                    <span className="font-medium">Ice Bath</span>
                  </div>
                  <button
                    onClick={() => handleToggleField('ice_bath_registered', !selectedCustomer.ice_bath_registered)}
                    disabled={isSaving}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                      selectedCustomer.ice_bath_registered 
                        ? "bg-blue-500 text-white" 
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                    {selectedCustomer.ice_bath_registered 
                      ? (lang === "th" ? "ลงทะเบียนแล้ว" : "Registered")
                      : (lang === "th" ? "ยังไม่ลงทะเบียน" : "Not Registered")
                    }
                  </button>
                </div>
              </div>

              {/* Pre-Survey */}
              <div className="p-4 rounded-xl border border-border bg-secondary/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-green-400" />
                    <span className="font-medium">{lang === "th" ? "แบบสำรวจก่อนงาน" : "Pre-Event Survey"}</span>
                  </div>
                  <button
                    onClick={() => handleToggleField('pre_survey_completed', !selectedCustomer.pre_survey_completed)}
                    disabled={isSaving}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                      selectedCustomer.pre_survey_completed 
                        ? "bg-green-500 text-white" 
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                    {selectedCustomer.pre_survey_completed 
                      ? (lang === "th" ? "เสร็จแล้ว" : "Completed")
                      : (lang === "th" ? "ยังไม่ทำ" : "Not Done")
                    }
                  </button>
                </div>
              </div>

              {/* Post-Survey */}
              <div className="p-4 rounded-xl border border-border bg-secondary/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-orange-400" />
                    <span className="font-medium">{lang === "th" ? "แบบสำรวจหลังงาน" : "Post-Event Survey"}</span>
                  </div>
                  <button
                    onClick={() => handleToggleField('post_survey_completed', !selectedCustomer.post_survey_completed)}
                    disabled={isSaving}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                      selectedCustomer.post_survey_completed 
                        ? "bg-orange-500 text-white" 
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                    {selectedCustomer.post_survey_completed 
                      ? (lang === "th" ? "เสร็จแล้ว" : "Completed")
                      : (lang === "th" ? "ยังไม่ทำ" : "Not Done")
                    }
                  </button>
                </div>
              </div>

              {/* Stamps */}
              <div className="p-4 rounded-xl border border-border bg-secondary/30">
                <h3 className="font-medium mb-3">{lang === "th" ? "แสตมป์" : "Stamps"} ({selectedCustomer.stamp_count}/{booths.length})</h3>
                <div className="grid grid-cols-2 gap-2">
                  {booths.map((booth) => {
                    const stamped = selectedCustomer.stamped_booths.includes(booth.id)
                    return (
                      <button
                        key={booth.id}
                        onClick={() => handleToggleStamp(booth.id)}
                        className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                          stamped 
                            ? "bg-primary/10 border-primary text-primary" 
                            : "border-border text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {stamped ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        <span className="text-sm truncate">{lang === "th" ? booth.name_th : booth.name_en}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}