import fetcher from "@/lib/fetcher";
import { Role } from "@/types/role";
import useSWR from "swr";

const useRoles = ({
  tenantId,
  organizationId,
}: {
  organizationId: string | undefined | null;
  tenantId: string | undefined | null;
}) => {
  const url =
    tenantId && organizationId
      ? `/tenant/roles?tenant_id=${tenantId}&organization_id=${organizationId}`
      : null;

  const { data: roles, isLoading, mutate } = useSWR<Role[]>(url, fetcher);

  return { roles: roles || [], mutate, isLoading };
};

export default useRoles;
