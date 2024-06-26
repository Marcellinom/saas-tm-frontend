/* eslint-disable react/no-children-prop */
"use client";

import { OrganizationContext } from "@/providers/OrganizationProvider";
import { useEffect, useState } from "react";
import React from "react";
import type { FieldApi } from "@tanstack/react-form";
import { TenantList } from "@/components/Tenant";
import {Tenant} from "@/components/Tenant"

export default function Home() {

  const [tenants, setTenants] = useState([]);
  const { selectedOrganization } = React.useContext(OrganizationContext);

  useEffect(() => {
    if (selectedOrganization == null) return
    const fetchTenants = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_TENANT_MANAGEMENT_API}/tenant/${selectedOrganization?.organizationId}`, {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        const data = await response.json();
        setTenants(data.data);
      } catch (error) {
        console.error("error fetching tenants: ", error);
      }
    }

    fetchTenants();
  }, [selectedOrganization]);

  return (
    <div>
      <div>
        <p className="p-5 pb-0 font-bold">
          Recently Added
        </p>
        <div className="p-5 grid grid-cols-3 lg:grid-cols-4 gap-5">
          {tenants.slice(0, 4).map((Tenant: Tenant) => (
            <TenantList
              tenant={Tenant}
              key={Tenant.name}
              aspectRatio="square"
              width={150}
              height={150}
            />
          ))}
        </div>
      </div>
      <div>
        <p className="p-5 pb-0 font-bold">
          All Tenants
        </p>
        <div className="p-5 grid grid-cols-3 lg:grid-cols-4 gap-5 w-4/7">
          {tenants.map((Tenant: Tenant) => (
            <TenantList
              tenant={Tenant}
              key={Tenant.tenant_id}
              className=""
              aspectRatio="square"
              width={150}
              height={150}
            />
          ))}
        </div>
      </div>
    </div >
  );
}

function FieldInfo({ field }: { field: FieldApi<any, any, any, any> }) {
  return (
    <div className="text-xs space-y-2 h-2">
      {field.state.meta.touchedErrors ? (
        <em className="text-red-700">{field.state.meta.touchedErrors}</em>
      ) : null}
    </div>
  );
}
