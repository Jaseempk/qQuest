"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Settings,
  Bell,
  Shield,
  CreditCard,
  Activity,
  Edit2,
  Wallet,
} from "lucide-react";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20 border-2 border-blue-500">
              <AvatarImage
                src="https://avatar.vercel.sh/rauchg.png"
                alt="User Avatar"
              />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-200 text-transparent bg-clip-text">
                John Doe
              </h1>
              <p className="text-gray-400">@johndoe</p>
            </div>
          </div>
          <Button variant="outline" className="flex items-center space-x-2">
            <Edit2 className="w-4 h-4" />
            <span>Edit Profile</span>
          </Button>
        </header>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <TabsList className="bg-gray-800/50 p-1 rounded-full">
            <TabsTrigger
              value="overview"
              className="rounded-full px-4 py-2 data-[state=active]:bg-blue-500"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="rounded-full px-4 py-2 data-[state=active]:bg-blue-500"
            >
              Activity
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="rounded-full px-4 py-2 data-[state=active]:bg-blue-500"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-gray-800/50 border-gray-700 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-blue-400" />
                    <span>User Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <Label className="text-gray-400">Username</Label>
                    <p>@johndoe</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Wallet Address</Label>
                    <p className="truncate">0x1234...5678</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-blue-400" />
                    <span>qQuest Stats</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <Label className="text-gray-400">Active Circles</Label>
                    <p>3</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Total Contributed</Label>
                    <p>$2,500</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Reputation Score</Label>
                    <Badge
                      variant="secondary"
                      className="bg-green-500/20 text-green-400"
                    >
                      98%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="bg-gray-800/50 border-gray-700 rounded-2xl">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest actions and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {[
                    {
                      action: "Joined Circle",
                      circle: "Travel Fund",
                      date: "2024-03-15",
                    },
                    {
                      action: "Made Payment",
                      circle: "Emergency Savings",
                      amount: "$100",
                      date: "2024-03-10",
                    },
                    {
                      action: "Created Circle",
                      circle: "New Laptop",
                      date: "2024-03-05",
                    },
                  ].map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between border-b border-gray-700 pb-2"
                    >
                      <div>
                        <p className="font-medium">{item.action}</p>
                        <p className="text-sm text-gray-400">{item.circle}</p>
                      </div>
                      <div className="text-right">
                        {item.amount && (
                          <p className="font-medium">{item.amount}</p>
                        )}
                        <p className="text-sm text-gray-400">{item.date}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              <Card className="bg-gray-800/50 border-gray-700 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-blue-400" />
                    <span>Notifications</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-notifications">
                      Email Notifications
                    </Label>
                    <Switch id="email-notifications" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-notifications">
                      Push Notifications
                    </Label>
                    <Switch id="push-notifications" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Wallet className="w-5 h-5 text-blue-400" />
                    <span>Wallet</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="wallet-address">Wallet Address</Label>
                    <Input
                      id="wallet-address"
                      value="0x1234...5678"
                      readOnly
                      className="mt-1 bg-gray-700"
                    />
                  </div>
                  <Button className="w-full">Disconnect Wallet</Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-blue-400" />
                    <span>Payment Methods</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">No payment methods added yet.</p>
                  <Button variant="outline" className="mt-4">
                    Add Payment Method
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
