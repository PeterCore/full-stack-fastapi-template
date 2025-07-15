import React from "react";
import { IconButton } from "@chakra-ui/react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MenuContent, MenuRoot, MenuTrigger } from "../ui/menu";
import type { Student } from "../../client";
import EditStudent from "./EditStudent";
import DeleteStudent from "./DeleteStudent";

interface StudentActionsMenuProps {
  student: Student;
}

const StudentActionsMenu = ({ student }: StudentActionsMenuProps) => {
  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <IconButton variant="ghost" color="inherit" aria-label="更多操作">
          <BsThreeDotsVertical />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <EditStudent student={student} />
        <DeleteStudent id={student.id!} />
      </MenuContent>
    </MenuRoot>
  );
};

export default StudentActionsMenu;
