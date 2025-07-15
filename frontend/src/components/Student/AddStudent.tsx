import { useState } from "react";
import { FaPlus } from "react-icons/fa";

import { useForm, type SubmitHandler } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { StudentService, type Student } from "../../client";
import {
  Button,
  DialogActionTrigger,
  DialogTitle,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import type { ApiError } from "../../client/core/ApiError";
import { handleError } from "../../utils";
import useCustomToast from "../../hooks/useCustomToast";
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

const AddStudent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showSuccessToast } = useCustomToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<Student>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      name: "",
      genders: 1,
      phone: "",
      remark: "",
      address: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: Student) =>
      StudentService.createStudentApi({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("学生创建成功");
      reset();
      setIsOpen(false);
    },
    onError: (err: ApiError) => {
      handleError(err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });

  const onSubmit: SubmitHandler<Student> = (data) => {
    mutation.mutate(data);
  };

  return (
    <DialogRoot
      size={{ base: "xs", md: "md" }}
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <Button my={4} colorScheme="teal">
          <FaPlus fontSize="16px" />
          添加学生
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>添加学生</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>请输入学生信息。</Text>
            <VStack gap={4}>
              <Field
                required
                invalid={!!errors.name}
                errorText={errors.name?.message}
                label="姓名"
              >
                <Input
                  id="name"
                  {...register("name", { required: "姓名是必填项" })}
                  placeholder="请输入姓名"
                  type="text"
                />
              </Field>
              <Field
                required
                invalid={!!errors.genders}
                errorText={errors.genders?.message}
                label="性别"
              >
                <select
                  id="genders"
                  {...register("genders", {
                    required: "请选择性别",
                    valueAsNumber: true,
                  })}
                  style={{
                    width: "100%",
                    padding: "8px 32px 8px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "14px",
                    backgroundColor: "white",
                  }}
                >
                  <option value="">请选择性别</option>
                  <option value={1}>男</option>
                  <option value={0}>女</option>
                </select>
              </Field>
              <Field
                invalid={!!errors.phone}
                errorText={errors.phone?.message}
                label="电话"
              >
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="请输入电话"
                  type="tel"
                />
              </Field>
              <Field
                invalid={!!errors.remark}
                errorText={errors.remark?.message}
                label="备注"
              >
                <Input
                  id="remark"
                  {...register("remark")}
                  placeholder="请输入备注"
                  type="text"
                />
              </Field>
              <Field
                invalid={!!errors.address}
                errorText={errors.address?.message}
                label="地址"
              >
                <Input
                  id="address"
                  {...register("address")}
                  placeholder="请输入地址"
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

export default AddStudent;
