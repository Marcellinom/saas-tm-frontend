"use client";

import { PlusCircle, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import UserTable from "./components/UserTable";
import React, { useContext } from "react";
import CreateDialog from "./components/CreateDialog";
import { OrganizationContext } from "@/providers/OrganizationProvider";
import useUsers from "@/hooks/useUsers";
import { useDebounceValue } from "usehooks-ts";

const Users = () => {
  const { selectedOrganization } = useContext(OrganizationContext);
  const organizationId = selectedOrganization?.organizationId || "";

  const [showDialog, setShowDialog] = React.useState(false);
  const [search, setSearch] = useDebounceValue("", 50);

  const { users, mutate } = useUsers({ organizationId });
  const filteredUsers = users?.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="flex flex-col w-full items-start gap-4 md:gap-8">
      <div className="flex items-center w-full justify-between">
        <div className="relative flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            // value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
          />
        </div>
        <div className="ml-auto flex whitespace-nowrap min-w-[110px] items-center gap-2">
          <Button
            size="sm"
            className="h-8 gap-1"
            onClick={() => setShowDialog(true)}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add User
            </span>
          </Button>
        </div>
      </div>

      <Card className="min-h-[60vh] w-full relative">
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage users in your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <UserTable users={filteredUsers} />
        </CardContent>
        {/* <CardFooter>
          <div className="text-xs text-muted-foreground">
            Showing <strong>1-10</strong> of <strong>32</strong> users
          </div>
        </CardFooter> */}
      </Card>

      <CreateDialog
        showDialog={showDialog}
        setShowDialog={setShowDialog}
        mutate={mutate}
      />
    </main>
  );
};

export default Users;
