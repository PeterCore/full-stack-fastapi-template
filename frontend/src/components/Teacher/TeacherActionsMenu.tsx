import { IconButton } from "@chakra-ui/react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MenuContent, MenuRoot, MenuTrigger } from "../ui/menu";
import type { Teacher } from "../../client";
import EditTeacher from "./EditTeacher";
import DeleteTeacher from "./DeleteTeacher";

interface TeacherActionsMenuProps {
  teacher: Teacher;
}

const TeacherActionsMenu = ({ teacher }: TeacherActionsMenuProps) => {
  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <IconButton variant="ghost" color="inherit" aria-label="更多操作">
          <BsThreeDotsVertical />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <EditTeacher teacher={teacher} />
        <DeleteTeacher id={teacher.id!} />
      </MenuContent>
    </MenuRoot>
  );
};

export default TeacherActionsMenu;
