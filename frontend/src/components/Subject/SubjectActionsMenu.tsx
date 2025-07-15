import { IconButton } from "@chakra-ui/react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MenuContent, MenuRoot, MenuTrigger } from "../ui/menu";
import type { Subject } from "../../client";
import DeleteSubject from "./DeleteSubject";
import EditSubject from "./EditSubject";

interface SubjectActionsMenuProps {
  subject: Subject;
}

const SubjectActionsMenu = ({ subject }: SubjectActionsMenuProps) => {
  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <IconButton variant="ghost" color="inherit" aria-label="更多操作">
          <BsThreeDotsVertical />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <EditSubject subject={subject} />
        <DeleteSubject id={subject.id!} />
      </MenuContent>
    </MenuRoot>
  );
};

export default SubjectActionsMenu;
