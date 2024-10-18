//
//  ProfileView.swift
//  qQuick
//
//  Created by Hani Atta on 18/10/24.
//

import SwiftUI

struct ProfileView: View {
    var body: some View {
        VStack {
            Text("Profile Content Goes Here")
                .foregroundColor(.white)
        }
        .navigationBarTitle("qQuick")
        .background(Color.black.edgesIgnoringSafeArea(.all))
    }
}

struct ProfileView_Previews: PreviewProvider {
    static var previews: some View {
        ProfileView()
    }
}
