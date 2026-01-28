'use client';

import { Button, Form, Input, notification } from 'antd';
import { runHaikuAgent } from '@/api/taightwads';
import { useEffect, useRef, useState } from 'react';

type FieldType = {
  subject: string;
};

export const SendHaikuAgentRequest = () => {
  const [isLoading, setIsLoading] =  useState(false);
  const [form] = Form.useForm<FieldType>();

    const onSubmit = async (values: FieldType) => {
      try {
        setIsLoading(true);
        await runHaikuAgent(values?.subject || '');
        form.resetFields(); 
      } catch (error) {
        console.error("Failed to send haiku agent request:", error);
        onError(error);
      } finally {
        setIsLoading(false);
      }
    }

      const inputRef = useRef<any | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  


  const [api, contextHolder] = notification.useNotification({ maxCount: 1 });

      const onError = (errorInfo: any) => {
        api.error({
          title: "Don't panic, but something went wrong",
          description: `Our slaves are working hard to fix the issue. We will dispatch someone to hit them harder soon.\n Please try again later.`,
          placement: 'top',
          showProgress: true,
          duration: 3,
          
        });
      }

  return <Form
    name="basic"
    form={form}
    labelCol={{ span: 8 }}
    wrapperCol={{ span: 16 }}
    style={{ maxWidth: 600, width: 'inherit' }}
    initialValues={{ remember: true }}
    onFinish={onSubmit}
    onFinishFailed={onError}
    autoComplete="off"
  >
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: "450px", alignItems: "flex-start" }}>
    <Form.Item<FieldType>
      label="Haiku Subject"
      name="subject"
       style={{ width: "100%" }}
      rules={[{ required: false, message: 'Please input your haiku subject!' }]}
    >
      <Input ref={inputRef}  style={{ width: "100%" }} disabled={isLoading} />
    </Form.Item>

    <Form.Item label={null}  style={{ width: "100%" }}>
      <Button type="primary" htmlType="submit" disabled={isLoading} loading={isLoading}  style={{ width: "100%" }}>
        Get a Haiku
      </Button>
    </Form.Item>
    {contextHolder}
    </div>
  </Form>
}
