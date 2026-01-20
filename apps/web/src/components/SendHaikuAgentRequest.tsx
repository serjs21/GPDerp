'use client';

import { Button, Form, Input, notification } from 'antd';
import { runHaikuAgent } from '@/api/taightwads';
import { useEffect } from 'react';

type FieldType = {
  subject: string;
};

export const SendHaikuAgentRequest = () => {
    const onSubmit = (values: FieldType) => {
        runHaikuAgent(values.subject);
    }


  const [api, contextHolder] = notification.useNotification();

      const onError = (errorInfo: any) => {
        api.error({
          title: "Don't panic, but something went wrong",
          description: 'Our slaves are working hard to fix the issue. Please try again later.',
          placement: 'top'
        });
      }

  return <Form
    name="basic"
    labelCol={{ span: 8 }}
    wrapperCol={{ span: 16 }}
    style={{ maxWidth: 600 }}
    initialValues={{ remember: true }}
    onFinish={onSubmit}
    onFinishFailed={onError}
    autoComplete="off"
  >
    <Form.Item<FieldType>
      label="Haiku Subject"
      name="subject"
      rules={[{ required: false, message: 'Please input your haiku subject!' }]}
    >
      <Input />
    </Form.Item>

    <Form.Item label={null}>
      <Button type="primary" htmlType="submit">
        Get a Haiku
      </Button>
    </Form.Item>
  </Form>
}
