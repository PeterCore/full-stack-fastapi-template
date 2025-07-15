import React, { useState } from "react";
import { Button } from "@chakra-ui/react";
import { FaEllipsisV, FaEdit, FaTrash } from "react-icons/fa";
import { MenuContent, MenuRoot, MenuTrigger } from "../ui/menu";
import EditSchedule from "./EditSchedule";
import DeleteSchedule from "./DeleteSchedule";

interface ScheduleActionsMenuProps {
  scheduleId: string;
  teacherName?: string;
}

export default function ScheduleActionsMenu({
  scheduleId,
  teacherName,
}: ScheduleActionsMenuProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <>
      <MenuRoot>
        <MenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <FaEllipsisV />
          </Button>
        </MenuTrigger>
        <MenuContent>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditOpen(true)}
            color="blue.600"
            width="100%"
            justifyContent="flex-start"
          >
            <FaEdit style={{ marginRight: "8px" }} />
            编辑课表
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDeleteOpen(true)}
            color="red.600"
            width="100%"
            justifyContent="flex-start"
          >
            <FaTrash style={{ marginRight: "8px" }} />
            删除课表
          </Button>
        </MenuContent>
      </MenuRoot>

      <EditSchedule
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        scheduleId={scheduleId}
      />

      <DeleteSchedule
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        scheduleId={scheduleId}
        teacherName={teacherName}
      />
    </>
  );
}
