//
//  qQuickApp.swift
//  qQuick
//
//  Created by Hani Atta on 18/10/24.
//

import SwiftUI
import CoinbaseWalletSDK

@main
struct qQuickApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .onOpenURL { url in
                    print("Opened URL: \(url.absoluteString)")
                    _ = try? CoinbaseWalletSDK.shared.handleResponse(url)
                }
        }
    }
}
