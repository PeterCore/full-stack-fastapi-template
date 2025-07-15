import React, { useState } from "react";
import { Button } from "@chakra-ui/react";
import { FaEllipsisV, FaEdit, FaTrash } from "react-icons/fa";
import { MenuContent, MenuRoot, MenuTrigger } from "../ui/menu";
import EditCourse from "./EditCourse";
import DeleteCourse from "./DeleteCourse";

interface CourseActionsMenuProps {
  courseId: string;
  teacherName?: string;
  subjectName?: string;
}

export default function CourseActionsMenu({
  courseId,
  teacherName,
  subjectName,
}: CourseActionsMenuProps) {
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
            编辑课程
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
            删除课程
          </Button>
        </MenuContent>
      </MenuRoot>

      <EditCourse
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        courseId={courseId}
      />

      <DeleteCourse
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        courseId={courseId}
        teacherName={teacherName}
        subjectName={subjectName}
      />
    </>
  );
}
