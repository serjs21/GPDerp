'use client';

import { Button, Form, Input, notification } from 'antd';
import { runHaikuAgent } from '@/api/agents';
import { useEffect, useRef, useState } from 'react';

type FieldType = {
  subject: string;
};

export const SendHaikuAgentRequest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm<FieldType>();
  const inputRef = useRef<any | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const [api, contextHolder] = notification.useNotification({ maxCount: 1 });

  const onError = () => {
    api.error({
      title: "Don't panic, but something went wrong",
      description:
        "Our slaves are working hard to fix the issue. We will dispatch someone to hit them harder soon.\nPlease try again later.",
      placement: 'top',
      duration: 3,
    });
  };

  const onSubmit = async (values: FieldType) => {
    try {
      setIsLoading(true);
      await runHaikuAgent(values?.subject || '');
      form.resetFields();
      inputRef.current?.focus();
    } catch (error) {
      console.error("Failed to send haiku agent request:", error);
      onError();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      style={{
        width: '100%',
        maxWidth: 420,
      }}
      onFinish={onSubmit}
      autoComplete="off"
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          width: '100%',
        }}
      >
        <Form.Item<FieldType>
          label="Haiku subject"
          name="subject"
          style={{ marginBottom: 0 }}
        >
          <Input
            ref={inputRef}
            disabled={isLoading}
            autoComplete="off"
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            block
          >
            Get a Haiku
          </Button>
        </Form.Item>

        {contextHolder}
      </div>
    </Form>
  );
};
