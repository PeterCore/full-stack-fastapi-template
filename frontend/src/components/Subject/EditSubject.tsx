import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SubjectService, type Subject } from "../../client";
import {
  Button,
  DialogActionTrigger,
  DialogTitle,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { handleError } from "../../utils";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from "../ui/dialog";
import { Field } from "../ui/field";
import { FiEdit2 } from "react-icons/fi";

interface EditSubjectProps {
  subject: Subject;
}

const EditSubject = ({ subject }: EditSubjectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<Subject>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: subject,
  });

  useEffect(() => {
    reset(subject);
  }, [subject, reset]);

  const mutation = useMutation({
    mutationFn: (data: Subject) =>
      SubjectService.updateSubjectApi({
        subjectId: subject.id!,
        requestBody: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      setIsOpen(false);
    },
    onError: (err: any) => {
      handleError(err);
    },
  });

  const onSubmit = (data: Subject) => {
    mutation.mutate(data);
  };

  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
      size={{ base: "xs", md: "md" }}
      placement="center"
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <FiEdit2 color="#0f766e" style={{ marginRight: 8 }} />
          <span style={{ color: "#0f766e", fontWeight: 600 }}>编辑学科</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>编辑学科</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>修改学科信息。</Text>
            <VStack gap={4}>
              <Field
                required
                invalid={!!errors.name}
                errorText={errors.name?.message}
                label="学科名称"
              >
                <Input
                  id="name"
                  {...register("name", { required: "学科名称是必填项" })}
                  placeholder="请输入学科名称"
                  type="text"
                />
              </Field>
              <Field
                invalid={!!errors.description}
                errorText={errors.description?.message}
                label="学科描述"
              >
                <Input
                  id="description"
                  {...register("description")}
                  placeholder="请输入学科描述"
                  type="text"
                />
              </Field>
            </VStack>
          </DialogBody>
          <DialogFooter gap={2}>
            <DialogActionTrigger asChild>
              <Button
                variant="subtle"
                colorPalette="gray"
                disabled={isSubmitting}
              >
                取消
              </Button>
            </DialogActionTrigger>
            <Button
              variant="solid"
              type="submit"
              disabled={!isValid}
              loading={isSubmitting}
            >
              保存
            </Button>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};

export default EditSubject;
