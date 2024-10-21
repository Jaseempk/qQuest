//
//  SplashScreen.swift
//  qQuick
//
//  Created by Hani Atta on 19/10/24.
//

import SwiftUI

struct SplashScreen: View {
    @State private var isActive = false

    var body: some View {
        VStack {
            if isActive {
                OnboardingView() // This will be the next screen (home page)
            } else {
                VStack {
                    Spacer()
                    Image("LOGO")
                        .foregroundColor(.blue)
                    
                    
                    Spacer()
                    
                    Text("Powered by Base")
                        .font(.caption)
                        .foregroundColor(.gray)
                        .padding(.bottom, 40)
                }
            }
        }
        .background(Color.black.edgesIgnoringSafeArea(.all))
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                withAnimation {
                    self.isActive = true
                }
            }
        }
    }
}

struct SplashScreen_Previews: PreviewProvider {
    static var previews: some View {
        SplashScreen()
    }
}
